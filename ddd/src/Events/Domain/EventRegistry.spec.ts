import { EventRegistry } from "./EventRegistry";
import { EventProvider } from "./EventProvider";
import { DomainEvent } from "./DomainEvent";
import { AggregateId } from "../../Identity";
import { EventId } from "./EventId";

class TestAggregateId extends AggregateId {}
class TestEvent extends DomainEvent<TestAggregateId> {
    get aggregateId(): TestAggregateId {
        return TestAggregateId.fromString(TestAggregateId, this.data.aggregateId);
    }
}

class TestProvider implements EventProvider<DomainEvent<TestAggregateId>> {
    public constructor(private events: DomainEvent<TestAggregateId>[]) {}

    dequeueEvents(): DomainEvent<TestAggregateId>[] {
        return this.events;
    }
}

describe("EventRegistry", () => {
    it("contains no events when created", () => {
        const registry = new EventRegistry();
        expect(registry.dequeueEvents().length).toBe(0);
    });

    it("returns all events when dequeued, which were registered by dequeueing providers", () => {
        const registry = new EventRegistry();

        const event1 = new TestEvent(
            EventId.next(EventId),
            new Date(),
            TestAggregateId.next(TestAggregateId),
            {}
        );
        const event2 = new TestEvent(
            EventId.next(EventId),
            new Date(),
            TestAggregateId.next(TestAggregateId),
            {}
        );
        const provider = new TestProvider([event1, event2]);

        registry.dequeueProviderAndRegisterEvents(provider);
        const dequeuedEvents = registry.dequeueEvents();
        expect(dequeuedEvents.length).toBe(2);
        expect(dequeuedEvents).toContain(event1);
        expect(dequeuedEvents).toContain(event2);
    });
});
