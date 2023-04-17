import { EntityState } from "./Entity";
import { AggregateId } from "../../Identity";
import {
    AggregateEventStream,
    DomainEvent,
    EventId,
    EventProvider,
    EventRegistry,
} from "../../Events";

export abstract class AggregateRoot<
    IdType extends AggregateId,
    AggregateEventType extends DomainEvent<IdType>,
    OwnState extends Record<string, any> = Record<string, any>
> implements EventProvider<AggregateEventType>
{
    protected events: EventRegistry<AggregateEventType>;
    protected state: EntityState<IdType> & OwnState;

    // constructor must be public because it will be called in event-sourced repositories
    public constructor(stream: AggregateEventStream<IdType, AggregateEventType>) {
        this.events = new EventRegistry<AggregateEventType>();

        stream.events.forEach((event: AggregateEventType) => {
            this.apply(event);
        });
    }

    public get id(): IdType {
        return this.state.id;
    }

    public get createdAt(): Date {
        return this.state.createdAt;
    }

    public dequeueEvents(): AggregateEventType[] {
        return this.events.dequeueEvents();
    }

    protected static nextEventId(): EventId {
        return EventId.next(EventId);
    }

    // used for raising events which change state of the aggregate root - never use it for entity events
    protected raiseAndApply(event: AggregateEventType): void {
        this.events.raiseEvent(event);
        this.apply(event);
    }

    private apply(event: AggregateEventType): void {
        const applicator = this.getApplyMethod(event);

        if (!applicator) {
            throw new Error(
                `No "apply${event.constructor.name}" method found on aggregate root class ${this.constructor.name} to apply event ${event.constructor.name}`
            );
        }

        applicator.call(this, event);
    }

    private getApplyMethod<SpecificEvent extends AggregateEventType>(
        event: SpecificEvent
    ): (event: SpecificEvent) => void | undefined {
        const { constructor } = Object.getPrototypeOf(event);

        const methodName = `apply${constructor.name}`;

        //@ts-ignore
        return this[methodName];
    }
}
