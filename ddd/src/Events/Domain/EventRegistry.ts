import { DomainEvent } from "./DomainEvent";
import { EventProvider } from "./EventProvider";

export class EventRegistry<EventType extends DomainEvent<any> = DomainEvent<any>>
    implements EventProvider<EventType>
{
    protected domainEvents: EventType[] = [];

    public dequeueProviderAndRegisterEvents(provider: EventProvider<any>): void {
        provider.dequeueEvents().forEach((event: EventType) => this.raiseEvent(event));
    }

    public raiseEvent(event: EventType): void {
        this.domainEvents.push(event);
    }

    public dequeueEvents(): EventType[] {
        const events = this.domainEvents;
        this.domainEvents = [];
        return events;
    }
}
