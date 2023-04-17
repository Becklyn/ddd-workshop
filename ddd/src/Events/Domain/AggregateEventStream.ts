import { AggregateId } from "../../Identity";
import { DomainEvent } from "./DomainEvent";

export class AggregateEventStream<
    AggregateIdType extends AggregateId,
    EventType extends DomainEvent<AggregateIdType>
> {
    public constructor(
        public readonly aggregateId: AggregateIdType,
        public readonly events: EventType[]
    ) {}

    get isEmpty(): boolean {
        return this.events.length === 0;
    }
}
