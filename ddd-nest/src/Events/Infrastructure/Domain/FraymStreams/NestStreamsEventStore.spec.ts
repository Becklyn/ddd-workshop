import { given, createMockAndInstance, when, then, resetTest } from "@becklyn/gherkin-style-tests";
import { anything, reset } from "ts-mockito";
import { EventBus } from "@nestjs/cqrs";
import { EventConstructorMap } from "../../../Domain/EventConstructorMap";
import { NestStreamsEventStore, NestStreamsEventStoreOptions } from "./NestStreamsEventStore";
import { StreamsService } from "./StreamsService";
import { Client, PublishEvent, SubscriptionEvent } from "@fraym/streams";
import { AggregateEventStream, AggregateId, DomainEvent, EventId } from "@becklyn/ddd";

class TestAggregateId extends AggregateId {}

class TestEvent extends DomainEvent<TestAggregateId, { readonly foo: string }> {
    get aggregateId(): TestAggregateId {
        return TestAggregateId.fromString(TestAggregateId, this.data.aggregateId);
    }

    get foo(): string {
        return this.data.foo;
    }
}

describe("NestStreamsEventStore", () => {
    const [streamsServiceMock, streamsService] = createMockAndInstance<StreamsService>();
    const [, eventBus] = createMockAndInstance<EventBus>();
    const [clientMock, client] = createMockAndInstance<Client>();
    const eventConstructorMap = new EventConstructorMap(new Map([["TestEvent", TestEvent]]));

    const options: NestStreamsEventStoreOptions = {
        singleTenantId: "test",
        topic: "test",
        eventMap: eventConstructorMap,
        eventBus,
        streamsService,
    };

    given(streamsServiceMock.client).returns(client);

    let eventStore: NestStreamsEventStore;

    beforeEach(async () => {
        reset(clientMock);
        resetTest();

        eventStore = await NestStreamsEventStore.initialize(options);
    });

    describe("initialize", () => {
        it("returns new instance of NestStreamsEventStore", async () => {
            const eventConstructorMap = new EventConstructorMap(new Map([]));

            when(
                await NestStreamsEventStore.initialize({
                    ...options,
                    eventMap: eventConstructorMap,
                })
            );

            then(clientMock.useEventHandlerForAllEventTypes(anything())).shouldHaveBeenCalledBefore(
                clientMock.subscribe(anything())
            );
            then([(topics: string[]) => topics[0] === options.topic]).shouldHaveBeenPassedTo(
                clientMock.subscribe
            );
        });
    });

    describe("append", () => {
        it("appends provided domain events to stream", async () => {
            const aggregateId = TestAggregateId.next(TestAggregateId);
            const eventId = EventId.next(EventId);
            const raisedAt = new Date();
            const data = { foo: "bar" };
            const event = new TestEvent(eventId, raisedAt, aggregateId, data);

            when(await eventStore.append(event));

            then([
                (_topic: string) => _topic === options.topic,
                (serializedEvents: PublishEvent[]) => {
                    const serializedEvent = serializedEvents[0];

                    return (
                        serializedEvents.length === 1 &&
                        serializedEvent.id === eventId.asString() &&
                        serializedEvent.payload.raisedAt.toString() == raisedAt.getTime() &&
                        serializedEvent.payload.aggregateId === aggregateId.asString() &&
                        serializedEvent.payload.foo === data.foo &&
                        serializedEvent.tenantId === options.singleTenantId &&
                        serializedEvent.type === "TestEvent" &&
                        serializedEvent.stream ===
                            `${aggregateId.aggregateType}-${aggregateId.asString()}` &&
                        serializedEvent.correlationId === null &&
                        serializedEvent.causationId === null
                    );
                },
            ]).shouldHaveBeenPassedTo(clientMock.publish);
        });
    });

    describe("getAggregateStream", () => {
        it("returns AggregateEventStream instance with deserialized domain events", async () => {
            const aggregateId = TestAggregateId.next(TestAggregateId);
            const eventId = EventId.next(EventId);
            const raisedAt = new Date();
            const data = {
                foo: "bar",
                raisedAt: raisedAt.getTime(), // we use our own raisedAt
            };

            const event: SubscriptionEvent = {
                id: eventId.asString(),
                raisedAt, // this one will be set by stream service
                topic: options.topic,
                payload: {
                    aggregateId: aggregateId.asString(),
                    ...data,
                },
                tenantId: options.singleTenantId,
                type: "TestEvent",
                stream: `${aggregateId.aggregateType}-${aggregateId.asString()}`,
            };

            given(
                clientMock.getStream(
                    options.topic,
                    `${aggregateId.aggregateType}-${aggregateId.asString()}`
                )
            ).returns([event]);

            when(await eventStore.getAggregateStream(aggregateId));

            then((aggregateStream: AggregateEventStream<TestAggregateId, TestEvent>) => {
                const events = aggregateStream.events;
                const event = events[0];

                expect(event).toBeInstanceOf(TestEvent);

                return (
                    events.length === 1 &&
                    event.id.equals(eventId) &&
                    event.aggregateId.equals(aggregateId) &&
                    event.foo == data.foo &&
                    event.raisedAt.getTime() === raisedAt.getTime()
                );
            }).shouldHaveBeenReturned();
        });
    });
});
