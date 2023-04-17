import { AggregateId, EntityId } from "../../Identity";
import { DomainEvent, EventId, EventRegistry } from "../../Events";
import { EventProvider } from "../../Events";

export interface EntityState<IdType extends EntityId> {
    id: IdType;
    createdAt: Date;
}

export abstract class Entity<
    IdType extends EntityId,
    AggregateEventType extends DomainEvent<AggregateId>,
    OwnState extends Record<string, any> = Record<string, any>
> implements EventProvider<AggregateEventType>
{
    protected events: EventRegistry<AggregateEventType>;
    protected state: EntityState<IdType> & OwnState;

    // entity constructors should never be public as entities should always be instantiated through static create or
    // recreate methods
    protected constructor(id: IdType, createdAt: Date, ownState: OwnState) {
        this.events = new EventRegistry<AggregateEventType>();

        this.state = { id, createdAt, ...ownState };
    }

    public get id(): IdType {
        return this.state.id;
    }

    public get createdAt(): Date {
        return this.state.createdAt;
    }

    protected static nextEventId(): EventId {
        return EventId.next(EventId);
    }

    public dequeueEvents(): AggregateEventType[] {
        return this.events.dequeueEvents();
    }
}
