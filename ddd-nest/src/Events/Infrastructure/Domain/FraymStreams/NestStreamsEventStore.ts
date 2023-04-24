import { AggregateEventStream, AggregateId, DomainEvent } from "@becklyn/ddd";
import { EventStore } from "../../../Domain/EventStore";
import {
    EventConstructorMap,
    EventConstructorMappingNotFoundError,
} from "../../../Domain/EventConstructorMap";
import { EventBus } from "@nestjs/cqrs";
import { Either, Optional } from "@becklyn/types";
import { StreamsService } from "./StreamsService";
import { SubscriptionEvent, Client, PublishEvent } from "@fraym/streams";

export class NestStreamsEventStore extends EventStore {
    private constructor(
        private readonly tenantId: string,
        private readonly topic: string,
        private readonly eventMap: EventConstructorMap,
        private readonly streamsService: StreamsService,
        private readonly eventBus: EventBus | null = null
    ) {
        super();

        if (eventBus) {
            this.client.useEventHandlerForAllEventTypes(async event => {
                await this.deserializeSubscriptionEvent(event).callAsync(async event => {
                    await event.callAsync(async event => {
                        await this.eventBus!.publish(event);
                    });
                });
            });
        }
    }

    public static async initialize(
        options: NestStreamsEventStoreOptions
    ): Promise<NestStreamsEventStore> {
        const eventStore = new NestStreamsEventStore(
            options.singleTenantId,
            options.topic,
            options.eventMap,
            options.streamsService,
            options.eventBus
        );

        if (options.eventBus === null) {
            return eventStore;
        }

        await eventStore.client.subscribe([options.topic]);

        console.log(` Subscribed to event stream topic '${options.topic}'`);

        return eventStore;
    }

    private get client(): Client {
        return this.streamsService.client;
    }

    public async append(event: DomainEvent<any, any> | DomainEvent<any, any>[]): Promise<void> {
        const events = event instanceof DomainEvent ? [event] : event;

        if (events.length === 0) {
            return;
        }

        const serializedEvents = events.map((event: DomainEvent<any, any>) => {
            const { id, correlationId, causationId, ...payload } = event.data;
            const stream = this.composeStreamName(event.aggregateType, event.aggregateId);
            const type = event.constructor.name;

            const jsonEvent: PublishEvent = {
                id,
                payload,
                tenantId: this.tenantId,
                type,
                stream,
                correlationId,
                causationId,
            };

            return jsonEvent;
        });

        await this.client.publish(this.topic, serializedEvents);
    }

    private composeStreamName<AggregateIdType extends AggregateId>(
        aggregateType: string,
        aggregateId: AggregateIdType
    ): string {
        return `${aggregateType}-${aggregateId.asString()}`;
    }

    public async getAggregateStream<AggregateIdType extends AggregateId>(
        aggregateId: AggregateIdType
    ): Promise<AggregateEventStream<AggregateIdType, DomainEvent<AggregateIdType, any>>> {
        const stream = this.composeStreamName(aggregateId.aggregateType, aggregateId);

        const streamEvents = await this.client.getStream(this.tenantId, stream);
        const deserializedEvents: DomainEvent<AggregateIdType, any>[] = [];

        for (const streamEvent of streamEvents) {
            this.deserializeSubscriptionEvent(streamEvent).call(deserializedEvent => {
                deserializedEvent.throwLeft().call(event => deserializedEvents.push(event));
            });
        }

        return new AggregateEventStream(aggregateId, deserializedEvents);
    }

    private deserializeSubscriptionEvent(
        subscriptionEvent: SubscriptionEvent
    ): Optional<Either<EventConstructorMappingNotFoundError, DomainEvent<any>>> {
        return Optional.fromValue(subscriptionEvent).map(subscriptionEvent =>
            this.deserialize(subscriptionEvent)
        );
    }

    private deserialize<EventType extends DomainEvent<any, any>>(
        subscriptionEvent: SubscriptionEvent
    ): Either<EventConstructorMappingNotFoundError, EventType> {
        return this.eventMap.constructorForEventName(subscriptionEvent.type!).map((ctor: any) => {
            const instance = Object.create(ctor.prototype);

            instance.data = {
                id: subscriptionEvent.id,
                correlationId: subscriptionEvent.correlationId ?? null,
                causationId: subscriptionEvent.causationId ?? null,
                ...subscriptionEvent.payload,
            };

            return instance as EventType;
        });
    }
}

export interface NestStreamsEventStoreOptions {
    singleTenantId: string;
    topic: string;
    eventMap: EventConstructorMap;
    streamsService: StreamsService;
    eventBus: EventBus | null;
}

export interface EventStoreProviderOptions {
    tenantId: string;
    topic: string;
}

export const EVENT_STORE_PROVIDER_OPTIONS = Symbol("EVENT_STORE_PROVIDER_OPTIONS");
