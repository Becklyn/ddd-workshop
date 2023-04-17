import { EventRegistry } from "../../Events/Domain/EventRegistry";
import { EventStore } from "../../Events/Domain/EventStore";
import { DomainEvent, EventId } from "../../Events";
import { EventSourcedTransactionManager } from "./EventSourcedTransactionManager";
import { AggregateId } from "../../Identity";
import { anything, reset } from "ts-mockito";
import { resetTest, given, when, then, createMockAndInstance } from "@becklyn/gherkin-style-tests";

class TestAggregateId extends AggregateId {}
class TestEvent extends DomainEvent<TestAggregateId> {
    get aggregateId(): TestAggregateId {
        return TestAggregateId.fromString(TestAggregateId, this.data.aggregateId);
    }
}

describe("EventSourcedTransactionManager", () => {
    const [eventRegistryMock, eventRegistry] = createMockAndInstance(EventRegistry);
    const [eventStoreMock, eventStore] = createMockAndInstance<EventStore>();

    const fixture = new EventSourcedTransactionManager(eventRegistry, eventStore);

    beforeEach(() => {
        reset(eventRegistryMock);
        reset(eventStoreMock);
        resetTest();
    });

    describe("begin", () => {
        it("dequeues the EventRegistry", async () => {
            when(await fixture.begin());
            then(eventRegistryMock.dequeueEvents()).shouldHaveBeenCalled();
        });

        it("appends nothing to EventStore", async () => {
            when(await fixture.begin());
            then(eventStoreMock.append(anything())).shouldNotHaveBeenCalled();
        });
    });

    describe("commit", () => {
        it("dequeues EventRegistry and appends dequeued events into EventStore", async () => {
            const events = [
                new TestEvent(
                    EventId.next(EventId),
                    new Date(),
                    TestAggregateId.next(TestAggregateId),
                    {}
                ),
            ];

            given(eventRegistryMock.dequeueEvents()).returns(events);
            when(await fixture.commit());
            then(eventRegistryMock.dequeueEvents())
                .shouldHaveBeenCalledOnce()
                .and(eventStoreMock.append(events))
                .shouldHaveBeenCalledOnce();
        });
    });

    describe("rollback", () => {
        it("dequeues the EventRegistry", async () => {
            when(await fixture.rollback());
            then(eventRegistryMock.dequeueEvents()).shouldHaveBeenCalled();
        });

        it("appends nothing to EventStore", async () => {
            when(await fixture.rollback());
            then(eventStoreMock.append(anything())).shouldNotHaveBeenCalled();
        });
    });
});
