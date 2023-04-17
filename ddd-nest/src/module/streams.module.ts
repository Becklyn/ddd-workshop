import { DynamicModule, Module, FactoryProvider } from "@nestjs/common";
import { StreamsService, StreamsServiceOptions, STREAMS_SERVICE_PROVIDER_OPTIONS } from "../Events";

@Module({})
export class StreamsModule {
    static forRootAsync(options: StreamsModuleOptions): DynamicModule {
        return {
            module: StreamsModule,
            providers: [
                {
                    provide: STREAMS_SERVICE_PROVIDER_OPTIONS,
                    useFactory: options.useFactory,
                    inject: options.inject,
                },
                {
                    provide: StreamsService,
                    useFactory: async (options: StreamsServiceOptions) => {
                        const { serverAddress, groupId, ackTimeout } = options;

                        return await StreamsService.initialize({
                            serverAddress,
                            groupId,
                            ackTimeout,
                        });
                    },
                    inject: [STREAMS_SERVICE_PROVIDER_OPTIONS],
                },
            ],
            exports: [StreamsService],
        };
    }
}

export type StreamsModuleOptions = Pick<
    FactoryProvider<Promise<StreamsServiceOptions>>,
    "useFactory" | "inject"
>;
