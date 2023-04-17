import { DynamicModule, Module, FactoryProvider, ModuleMetadata } from "@nestjs/common";
import { CqrsModule, EventBus, CommandBus as NestCommandBusBase } from "@nestjs/cqrs";
import { EventSourcedTransactionManager } from "@becklyn/ddd";
import { NestCommandBus, CommandBus } from "../Commands";
import {
    EventConstructorMap,
    EventRegistry,
    EventStore,
    EventStoreProviderOptions,
    EVENT_STORE_PROVIDER_OPTIONS,
    NestStreamsEventStore,
    StreamsService,
} from "../Events";
import { TransactionManager } from "../Transactions";
import { StreamsModule, StreamsModuleOptions } from "./streams.module";
import {
    COMMAND_STORE_PROVIDER_OPTIONS,
    CommandStoreProviderOptions,
    NestStreamsCommandStore,
} from "../Commands/Infrastructure/Application/NestStreamsCommandStore";
import { CommandStore } from "../Commands/Application/CommandStore";

@Module({})
export class DddModule {
    static forRootAsync(options: DddOptions): DynamicModule {
        return {
            module: DddModule,
            global: true,
            imports: [
                CqrsModule,
                StreamsModule.forRootAsync({
                    useFactory: options.streamsServiceOptions.useFactory,
                    inject: options.streamsServiceOptions.inject,
                }),
                ...(options.imports ? options.imports : []),
            ],
            providers: [
                {
                    provide: EventConstructorMap,
                    useFactory: () => {
                        return new EventConstructorMap(options.eventConstructorMap);
                    },
                },
                EventRegistry,
                {
                    provide: EVENT_STORE_PROVIDER_OPTIONS,
                    useFactory: options.eventStoreProvider.useFactory,
                    inject: options.eventStoreProvider.inject,
                },
                {
                    provide: EventStore,
                    useFactory: async (
                        options: EventStoreProviderOptions,
                        eventMap: EventConstructorMap,
                        streamsService: StreamsService,
                        eventBus: EventBus
                    ) => {
                        return await NestStreamsEventStore.initialize({
                            singleTenantId: options.tenantId,
                            topic: options.topic,
                            eventMap,
                            streamsService,
                            eventBus,
                        });
                    },
                    inject: [
                        EVENT_STORE_PROVIDER_OPTIONS,
                        EventConstructorMap,
                        StreamsService,
                        EventBus,
                    ],
                },
                {
                    provide: TransactionManager,
                    useFactory: (er: EventRegistry, es: EventStore) => {
                        return new EventSourcedTransactionManager(er, es);
                    },
                    inject: [EventRegistry, EventStore],
                },
                {
                    provide: COMMAND_STORE_PROVIDER_OPTIONS,
                    useFactory: options.commandStoreProvider.useFactory,
                    inject: options.commandStoreProvider.inject,
                },
                {
                    provide: CommandStore,
                    useFactory: (
                        options: CommandStoreProviderOptions,
                        streamsService: StreamsService
                    ) => {
                        return new NestStreamsCommandStore(
                            options.tenantId,
                            options.topic,
                            streamsService
                        );
                    },
                    inject: [COMMAND_STORE_PROVIDER_OPTIONS, StreamsService],
                },
                {
                    provide: CommandBus,
                    useFactory: (commandStore: CommandStore, commandBus: NestCommandBusBase) => {
                        const bus = new NestCommandBus(commandBus);
                        bus.setCommandStore(commandStore);
                        return bus;
                    },
                    inject: [CommandStore, NestCommandBusBase],
                },
            ],
            exports: [
                CommandBus,
                EventRegistry,
                EventStore,
                TransactionManager,
                EventConstructorMap,
            ],
        };
    }
}

export interface DddOptions extends Pick<ModuleMetadata, "imports"> {
    eventConstructorMap: Map<string, any>;
    streamsServiceOptions: StreamsModuleOptions;
    eventStoreProvider: Pick<
        FactoryProvider<Promise<EventStoreProviderOptions>>,
        "useFactory" | "inject"
    >;
    commandStoreProvider: Pick<
        FactoryProvider<Promise<CommandStoreProviderOptions>>,
        "useFactory" | "inject"
    >;
}
