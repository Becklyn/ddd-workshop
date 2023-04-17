import { AggregateId, EntityId, EntityIdString } from "../../Identity";
import { DomainEvent, EventId } from "../../Events";
import { Entity } from "./Entity";
import { then, when } from "@becklyn/gherkin-style-tests";

class TestEntityId extends EntityId {}
class TestAggregateId extends AggregateId {}

// each aggregate should have a base abstract event class that implements the aggregateId getter
abstract class TestAggregateEventBase<
    OwnProps extends Record<string, any> = Record<string, any>
> extends DomainEvent<TestAggregateId, OwnProps> {
    get aggregateId(): TestAggregateId {
        return TestAggregateId.fromString(TestAggregateId, this.data.aggregateId);
    }
}

// all events related to non-root entities will have an entity id so it is a good idea to create a new abstract
// base class for them
abstract class TestEntityEventBase<
    OwnProps extends Record<string, any> = Record<string, any>
> extends TestAggregateEventBase<
    OwnProps & {
        readonly entityId: EntityIdString;
    }
> {
    // events should implement getters for data fields - this is especially useful when the data is represented by
    // value objects in the domain, because event data is stored as primitives and the VO needs to be constructed
    get entityId(): TestEntityId {
        return TestEntityId.fromString(TestEntityId, this.data.entityId);
    }
}

class TestEntityCreated extends TestEntityEventBase<{ somethingElse: string }> {
    // Concrete events don't need constructors if all of their own props are represented by primitives in the domain,
    // but if they're represented by value objects then a constructor is desirable so that code instantiating events
    // does not need to convert value objects to primitives in order to pass their value to the event
    public constructor(
        id: EventId,
        raisedAt: Date,
        aggregateId: TestAggregateId,
        entityId: TestEntityId,
        somethingElse: string
    ) {
        super(id, raisedAt, aggregateId, { entityId: entityId.asString(), somethingElse });
    }

    get somethingElse(): string {
        return this.data.somethingElse;
    }
}

class TestEntityStateChanged extends TestEntityEventBase<{ somethingElse: string }> {
    public constructor(
        id: EventId,
        raisedAt: Date,
        aggregateId: TestAggregateId,
        entityId: TestEntityId,
        somethingElse: string
    ) {
        super(id, raisedAt, aggregateId, { entityId: entityId.asString(), somethingElse });
    }

    get somethingElse(): string {
        return this.data.somethingElse;
    }
}

class TestEntity extends Entity<
    TestEntityId,
    TestAggregateEventBase,
    {
        parentId: TestAggregateId;
        somethingElse: string;
        childEntity: TestChildEntity | null;
    }
> {
    // a static create method is used to create new entities
    public static create(
        parentId: TestAggregateId,
        id: TestEntityId,
        somethingElse = "foo"
    ): TestEntity {
        // since default values of state props can't be defined as part of the state shape, they must be passed to
        // the constructor in create and recreate
        const self = new TestEntity(id, new Date(), {
            parentId,
            somethingElse,
            childEntity: null,
        });
        self.events.raiseEvent(
            new TestEntityCreated(EventId.next(EventId), new Date(), parentId, id, somethingElse)
        );
        return self;
    }

    // A static recreate method is used when instantiating entities while reconstructing an aggregate from an event
    // stream; when the aggregate root applies an entity created event, it instantiates the entity using this method
    // recreate methods. A recreate method must never raise events.
    public static recreate(
        parentId: TestAggregateId,
        id: TestEntityId,
        createdAt: Date,
        somethingElse = "foo"
    ): TestEntity {
        return new TestEntity(id, createdAt, {
            parentId,
            somethingElse,
            childEntity: null,
        });
    }

    // entity state is protected which means we need getters to publicly expose specific properties, but this is also
    // a good practice for internal use
    public get parentId(): TestAggregateId {
        return this.state.parentId;
    }

    public get somethingElse(): string {
        return this.state.somethingElse;
    }

    // for testing purposes
    public nextEventIdScaffold(): EventId {
        return TestEntity.nextEventId();
    }

    // for testing purposes
    public raiseEventScaffold(event: TestAggregateEventBase): void {
        this.events.raiseEvent(event);
    }
}

class TestChildEntityId extends EntityId {}
class TestChildEntity extends Entity<
    TestChildEntityId,
    TestAggregateEventBase,
    { parentId: TestEntityId }
> {
    public static create(parentId: TestEntityId, id: TestChildEntityId): TestChildEntity {
        return new TestChildEntity(id, new Date(), { parentId });
    }

    // for testing purposes
    public raiseEventScaffold(event: TestAggregateEventBase): void {
        this.events.raiseEvent(event);
    }
}

describe("Entity", () => {
    describe("constructor", () => {
        it("successfully sets id", () => {
            const id = TestEntityId.next(TestEntityId);
            const entity = TestEntity.create(TestAggregateId.next(TestAggregateId), id);

            when(entity.id);
            then(id).shouldHaveBeenReturned();
        });

        it("successfully sets createdAt", () => {
            const id = TestEntityId.next(TestEntityId);
            const createdAt = new Date();
            const entity = TestEntity.recreate(
                TestAggregateId.next(TestAggregateId),
                id,
                createdAt
            );

            when(entity.createdAt.getTime());
            then(createdAt.getTime()).shouldHaveBeenReturned();
        });

        it("successfully sets state props specific to concrete entity", () => {
            const parentId = TestAggregateId.next(TestAggregateId);
            const entity = TestEntity.create(parentId, TestEntityId.next(TestEntityId));

            when(entity.parentId.equals(parentId));
            then(true).shouldHaveBeenReturned();
        });
    });

    describe("dequeueEvents", () => {
        it("returns all events raised by raiseEvent", () => {
            const event1 = new TestEntityStateChanged(
                EventId.next(EventId),
                new Date(),
                TestAggregateId.next(TestAggregateId),
                TestEntityId.next(TestEntityId),
                "something"
            );
            const event2 = new TestEntityStateChanged(
                EventId.next(EventId),
                new Date(),
                TestAggregateId.next(TestAggregateId),
                TestEntityId.next(TestEntityId),
                "else"
            );

            const entity = TestEntity.create(
                TestAggregateId.next(TestAggregateId),
                TestEntityId.next(TestEntityId)
            );
            entity.dequeueEvents(); // get rid of the created event

            entity.raiseEventScaffold(event1);
            entity.raiseEventScaffold(event2);

            when(entity.dequeueEvents());
            then(
                (dequeuedEvents: DomainEvent<any>[]) =>
                    dequeuedEvents.length === 2 &&
                    dequeuedEvents.includes(event1) &&
                    dequeuedEvents.includes(event2)
            ).shouldHaveBeenReturned();
        });

        it("deletes all raised events after returning them", () => {
            const entity = TestEntity.create(
                TestAggregateId.next(TestAggregateId),
                TestEntityId.next(TestEntityId)
            );
            entity.dequeueEvents();
            expect(entity.dequeueEvents().length).toBe(0);

            entity.raiseEventScaffold(
                new TestEntityStateChanged(
                    EventId.next(EventId),
                    new Date(),
                    TestAggregateId.next(TestAggregateId),
                    TestEntityId.next(TestEntityId),
                    "something"
                )
            );

            when(entity.dequeueEvents().length);
            then((eventCount: number) => eventCount > 0).shouldHaveBeenReturned();

            when(entity.dequeueEvents().length);
            then(0).shouldHaveBeenReturned();
        });
    });

    describe("nextEventId", () => {
        it("returns EventId", () => {
            const entity = TestEntity.create(
                TestAggregateId.next(TestAggregateId),
                TestEntityId.next(TestEntityId)
            );

            when(entity.nextEventIdScaffold());
            then(id => id instanceof EventId).shouldHaveBeenReturned();
        });
    });
});
