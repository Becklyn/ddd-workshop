import { AggregateId } from "../../Identity";
import { DomainEvent } from "./DomainEvent";
import { EventId } from "./EventId";
import { AggregateEventStream } from "./AggregateEventStream";

class TestAggregateId extends AggregateId {}
class TestEvent extends DomainEvent<TestAggregateId> {
    get aggregateId(): TestAggregateId {
        return TestAggregateId.fromString(TestAggregateId, this.data.aggregateId);
    }
}

describe("AggregateEventStream", () => {
    describe("constructor", () => {
        it("successfully initializes props", () => {
            const aggregateId = TestAggregateId.next(TestAggregateId);
            const event = new TestEvent(EventId.next(EventId), new Date(), aggregateId, {});
            const stream = new AggregateEventStream(aggregateId, [event]);

            expect(stream.aggregateId).toBe(aggregateId);
            expect(stream.events.length).toBe(1);
            expect(stream.events[0]).toBe(event);
        });
    });

    describe("isEmpty", () => {
        it("returns true if there are no events in stream", () => {
            const aggregateId = TestAggregateId.next(TestAggregateId);
            const stream = new AggregateEventStream(aggregateId, []);

            expect(stream.isEmpty).toBeTruthy();
        });

        it("returns false if there are events in stream", () => {
            const aggregateId = TestAggregateId.next(TestAggregateId);
            const event = new TestEvent(EventId.next(EventId), new Date(), aggregateId, {});
            const stream = new AggregateEventStream(aggregateId, [event]);

            expect(stream.isEmpty).toBeFalsy();
        });
    });
});
