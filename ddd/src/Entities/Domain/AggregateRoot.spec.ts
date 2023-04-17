import { AggregateId, AggregateIdString, EntityId, EntityIdString } from "../../Identity";
import { AggregateEventStream, DomainEvent, EventId } from "../../Events";
import { Entity } from "./Entity";
import { AggregateRoot } from "./AggregateRoot";
import { then, when } from "@becklyn/gherkin-style-tests";
import { findOneEntityById } from "./utils";
import { Optional, OptionalValue } from "@becklyn/types";

class TestEntityId extends EntityId {}
class TestAggregateId extends AggregateId {}
class TestRelatedId extends AggregateId {}

// each aggregate should have a base abstract event class that implements the aggregateId getter
abstract class TestAggregateEventBase<
    OwnProps extends Record<string, any> = Record<string, any>
> extends DomainEvent<TestAggregateId, OwnProps> {
    get aggregateId(): TestAggregateId {
        return TestAggregateId.fromString(TestAggregateId, this.data.aggregateId);
    }
}

class TestAggregateRootCreated extends TestAggregateEventBase {}

class TestAggregateRootStateChanged extends TestAggregateEventBase<{
    readonly relationFieldStateChange: OptionalValue<AggregateIdString>;
}> {
    // Concrete events don't need constructors if all of their own props are represented by primitives in the domain,
    // but if they're represented by value objects then a constructor is desirable so that code instantiating events
    // does not need to convert value objects to primitives in order to pass their value to the event
    public constructor(
        id: EventId,
        raisedAt: Date,
        aggregateId: TestAggregateId,
        relatedId: Optional<TestRelatedId>
    ) {
        super(id, raisedAt, aggregateId, {
            relationFieldStateChange: relatedId.map(relatedId => relatedId.asString()).value,
        });
    }

    // events should implement getters for data fields - this is especially useful when the data is represented by
    // value objects in the domain, because event data is stored as primitives and the VO needs to be constructed
    get relationFieldStateChange(): Optional<TestRelatedId> {
        return Optional.fromValue(this.data.relationFieldStateChange).map(relatedIdValue =>
            TestRelatedId.fromString(TestRelatedId, relatedIdValue)
        );
    }
}

class TestAggregateRootEventWithoutApplyMethod extends TestAggregateEventBase {}

class TestAggregateRoot extends AggregateRoot<
    TestAggregateId,
    TestAggregateEventBase,
    {
        relationField: Optional<TestRelatedId>;
        childEntities: TestEntity[];
    }
> {
    get relationField(): Optional<TestRelatedId> {
        return this.state.relationField;
    }

    // Each aggregate root must have a static create method which returns a new instance by calling the constructor
    // implemented in the AggregateRoot base class and passing an event stream consisting only of an
    // "aggregate root created" event. This event must then be raised by the newly constructed instance -
    // not raised and applied!
    public static create(id: TestAggregateId): TestAggregateRoot {
        const created = new TestAggregateRootCreated(this.nextEventId(), new Date(), id, {});

        const self = new TestAggregateRoot(new AggregateEventStream(id, [created]));

        self.events.raiseEvent(created);

        return self;
    }

    // apply methods must be protected; if they are private ts will complain that they're not used anywhere
    protected applyTestAggregateRootCreated(event: TestAggregateRootCreated): void {
        this.state = {
            id: event.aggregateId,
            createdAt: event.raisedAt,
            relationField: Optional.null(),
            childEntities: [],
        };
    }

    public changeLocalState(newRelationFieldValue: OptionalValue<TestRelatedId>): void {
        // execute domain logic before calling raiseAndApply

        this.raiseAndApply(
            new TestAggregateRootStateChanged(
                TestAggregateRoot.nextEventId(),
                new Date(),
                this.id,
                Optional.fromValue(newRelationFieldValue)
            )
        );
    }

    protected applyTestAggregateRootStateChanged(event: TestAggregateRootStateChanged): void {
        this.state.relationField = event.relationFieldStateChange;
    }

    public addChildEntity(entityProp: string) {
        // any domain logic when non-root entities are involved should be encapsulated in the entity methods
        // that the aggregate root calls

        const childEntity = TestEntity.create(this.id, TestEntityId.next(TestEntityId), entityProp);

        this.state.childEntities.push(childEntity);

        // non-root entities must be dequeued by the aggregate root and their events registered by the root
        // after any operations on them are executed - never call raiseAndApply for non-root entity related events
        this.events.dequeueProviderAndRegisterEvents(childEntity);
    }

    // apply methods related to non-root entities are only called during construction of an aggregate from an
    // event stream
    protected applyTestEntityCreated(event: TestEntityCreated): void {
        const childEntity = TestEntity.recreate(
            event.aggregateId,
            event.entityId,
            event.raisedAt,
            event.entityProp
        );

        this.state.childEntities.push(childEntity);

        // non-root entities must always be dequeued when applying events related to them because the only way
        // to apply those events is by calling entity methods which raise those events in the first place
        childEntity.dequeueEvents();
    }

    public changeChildEntityState(childId: TestEntityId, newEntityPropValue: string) {
        const child = findOneEntityById(this.state.childEntities, childId);

        child.callEither(
            () => {
                throw Error("wrong child id passed");
            },
            child => {
                child.doSomething(newEntityPropValue);
                this.events.dequeueProviderAndRegisterEvents(child);
            }
        );
    }

    protected applyTestEntityStateChanged(event: TestEntityStateChanged): void {
        const child = findOneEntityById(this.state.childEntities, event.entityId);

        child.callEither(
            () => {
                throw Error("wrong child id passed");
            },
            child => {
                child.doSomething(event.entityPropChangedValue);
                child.dequeueEvents();
            }
        );
    }

    public raiseAndApplyEventWithoutApplyMethod(): void {
        this.raiseAndApply(
            new TestAggregateRootEventWithoutApplyMethod(
                EventId.next(EventId),
                new Date(),
                this.id,
                {}
            )
        );
    }
}

// all events related to non-root entities will have an entity id so it is a good idea to create a new abstract
// base class for them
abstract class TestEntityEvent<
    OwnProps extends Record<string, any> = Record<string, any>
> extends TestAggregateEventBase<OwnProps & { entityId: EntityIdString }> {
    public constructor(
        id: EventId,
        raisedAt: Date,
        aggregateId: TestAggregateId,
        entityId: TestEntityId,
        ownProps: OwnProps
    ) {
        super(id, raisedAt, aggregateId, { entityId: entityId.asString(), ...ownProps });
    }

    get entityId(): TestEntityId {
        return TestEntityId.fromString(TestEntityId, this.data.entityId);
    }
}

class TestEntityCreated extends TestEntityEvent<{
    entityProp: string;
}> {
    get entityProp(): string {
        return this.data.entityProp;
    }
}

class TestEntityStateChanged extends TestEntityEvent<{
    entityPropChangedValue: string;
}> {
    get entityPropChangedValue(): string {
        return this.data.entityPropChangedValue;
    }
}

class TestEntity extends Entity<
    TestEntityId,
    TestAggregateEventBase,
    {
        parentId: TestAggregateId;
        entityProp: string;
    }
> {
    get parentId(): TestAggregateId {
        return this.state.parentId;
    }

    get entityProp(): string {
        return this.state.entityProp;
    }

    // each non-aggregate-root entity should have a static create method which calls the constructor with a newly generated date
    // for the createdAt property and raises a new "entity created" event
    public static create(
        parentId: TestAggregateId,
        id: TestEntityId,
        entityProp: string
    ): TestEntity {
        const self = new TestEntity(id, new Date(), { parentId, entityProp });
        self.events.raiseEvent(
            new TestEntityCreated(this.nextEventId(), new Date(), parentId, id, { entityProp })
        );
        return self;
    }

    // each non-aggregate-non-root entity should have a static recreate method that is used when reconstructing the entity from
    // an event stream; it should raise no events
    public static recreate(
        parentId: TestAggregateId,
        id: TestEntityId,
        createdAt: Date,
        entityProp: string
    ): TestEntity {
        return new TestEntity(id, createdAt, { parentId, entityProp });
    }

    public doSomething(newEntityPropValue: string): void {
        // domain logic here
        this.state.entityProp = newEntityPropValue;

        // non-root entities raise events relevant for them
        this.events.raiseEvent(
            new TestEntityStateChanged(
                TestEntity.nextEventId(),
                new Date(),
                this.parentId,
                this.id,
                { entityPropChangedValue: newEntityPropValue }
            )
        );
    }
}

describe("AggregateRoot", () => {
    describe("constructor", () => {
        it("returns aggregate root with same state as produced by actions that raised the events passed to it", () => {
            const aggregateRoot = TestAggregateRoot.create(TestAggregateId.next(TestAggregateId));

            const newLocalState = TestRelatedId.next(TestRelatedId);
            expect(aggregateRoot.relationField.value).not.toBe(newLocalState);

            aggregateRoot.changeLocalState(newLocalState);

            when(
                new TestAggregateRoot(
                    new AggregateEventStream(aggregateRoot.id, aggregateRoot.dequeueEvents())
                )
            );
            then((reconstitutedAggregateRoot: TestAggregateRoot) => {
                return (
                    reconstitutedAggregateRoot.id.equals(aggregateRoot.id) &&
                    reconstitutedAggregateRoot.createdAt.getTime() ===
                        aggregateRoot.createdAt.getTime() &&
                    reconstitutedAggregateRoot.relationField.value !== null &&
                    reconstitutedAggregateRoot.relationField.value.equals(newLocalState)
                );
            }).shouldHaveBeenReturned();
        });
    });

    describe("raiseAndApply", () => {
        it("adds event to own events", () => {
            const aggregateRoot = TestAggregateRoot.create(TestAggregateId.next(TestAggregateId));
            aggregateRoot.dequeueEvents(); // removes any events raised during creation

            when(aggregateRoot.changeLocalState(TestRelatedId.next(TestRelatedId)));
            when(aggregateRoot.dequeueEvents());
            then((events: TestAggregateRootStateChanged[]) => {
                return (
                    events.length === 1 &&
                    events[0].aggregateId.equals(aggregateRoot.id) &&
                    events[0].relationFieldStateChange.isNotNull()
                );
            }).shouldHaveBeenReturned();
        });

        it("applies state change from event", () => {
            const aggregateRoot = TestAggregateRoot.create(TestAggregateId.next(TestAggregateId));

            const newValue = TestRelatedId.next(TestRelatedId);

            expect(aggregateRoot.relationField.value).not.toBe(newValue);

            when(aggregateRoot.changeLocalState(newValue));
            when(aggregateRoot.relationField.value);
            then((actual: TestRelatedId) => actual.equals(newValue)).shouldHaveBeenReturned();
        });

        it("throws exception if no apply method is found for event", () => {
            const aggregateRoot = TestAggregateRoot.create(TestAggregateId.next(TestAggregateId));

            when(() =>
                aggregateRoot.raiseAndApplyEventWithoutApplyMethod()
            ).thenErrorShouldHaveBeenThrown(
                `No "applyTestAggregateRootEventWithoutApplyMethod" method found on aggregate root class ${aggregateRoot.constructor.name} to apply event TestAggregateRootEventWithoutApplyMethod`
            );
        });
    });
});
