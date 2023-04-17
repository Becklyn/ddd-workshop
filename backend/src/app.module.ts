import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { DddModule } from "@becklyn/ddd-nest";
import * as AppEvents from "./app.events";
import { EventOrganizingModule } from "@EventOrganizing/Application/eventOrganizing.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true, // set to global - no need to import ConfigModule in child modules
            envFilePath: [".env.local", ".env"],
        }),
        DddModule.forRootAsync({
            eventConstructorMap: new Map(Object.entries(AppEvents)),
            streamsServiceOptions: {
                useFactory: async (configService: ConfigService) => {
                    return buildStreamServiceOptionsFromConfig(configService);
                },
                inject: [ConfigService],
            },
            eventStoreProvider: {
                useFactory: async (configService: ConfigService) =>
                    buildStoreOptionsFromConfig(configService, "STREAMS_SERVICE_TOPIC"),
                inject: [ConfigService],
            },
            commandStoreProvider: {
                useFactory: async (configService: ConfigService) =>
                    buildStoreOptionsFromConfig(configService, "COMMAND_STORE_TOPIC"),
                inject: [ConfigService],
            },
        }),
        EventOrganizingModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}

const buildStreamServiceOptionsFromConfig = (configService: ConfigService) => {
    const serverAddress = configService.get<string>("STREAMS_SERVICE_CONNECTION");

    if (!serverAddress) {
        throw new Error("'STREAMS_SERVICE_CONNECTION' not defined in .env");
    }

    let options;

    const ackTimeout = configService.get<string>("STREAMS_SERVICE_ACK_TIMEOUT")!;
    if (ackTimeout !== undefined) {
        options = {
            serverAddress,
            groupId: configService.get<string>("STREAMS_SERVICE_GROUP_ID"),
            ackTimeout: parseInt(ackTimeout),
        };
    } else {
        options = {
            serverAddress,
            groupId: configService.get<string>("STREAMS_SERVICE_GROUP_ID"),
        };
    }

    return options;
};

const buildStoreOptionsFromConfig = (
    configService: ConfigService,
    topicConfigKey: string
): { topic: string; tenantId: string } => {
    const topic = configService.get<string>(topicConfigKey);

    if (!topic) {
        throw new Error(`'${topicConfigKey}' not defined in .env`);
    }

    const tenantId = configService.get<string>("STREAMS_SERVICE_TENANT_ID");

    if (!tenantId) {
        throw new Error("'STREAMS_SERVICE_TENANT_ID' not defined in .env");
    }

    return {
        topic,
        tenantId,
    };
};
