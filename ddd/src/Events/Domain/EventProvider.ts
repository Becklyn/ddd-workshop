import { DomainEvent } from "./DomainEvent";

export interface EventProvider<EventType extends DomainEvent<any>> {
    dequeueEvents(): EventType[];
}
