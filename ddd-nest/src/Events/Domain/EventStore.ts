import { AggregateEventStream, AggregateId, DomainEvent, EventStore as Base } from "@becklyn/ddd";
import { Injectable } from "@nestjs/common";

@Injectable()
export abstract class EventStore implements Base {
    public abstract append(event: DomainEvent<any, any>): Promise<void>;
    public abstract append(events: DomainEvent<any, any>[]): Promise<void>;

    public abstract getAggregateStream<T extends AggregateId>(
        aggregateId: T
    ): Promise<AggregateEventStream<T, DomainEvent<T, any>>>;
}
