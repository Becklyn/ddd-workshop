import { DomainEvent } from "./DomainEvent";
import { AggregateId } from "../../Identity";
import { AggregateEventStream } from "./AggregateEventStream";

export interface EventStore {
    /**
     * Appends an event or array of events in a single transaction
     */
    append(event: DomainEvent<any>): Promise<void>;
    append(events: DomainEvent<any>[]): Promise<void>;

    getAggregateStream<AggregateIdType extends AggregateId>(
        aggregateId: AggregateIdType
    ): Promise<AggregateEventStream<AggregateIdType, DomainEvent<AggregateIdType>>>;
}
