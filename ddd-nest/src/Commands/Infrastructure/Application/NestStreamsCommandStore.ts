import { PublishEvent } from "@fraym/streams";
import { CommandStore } from "../../Application/CommandStore";
import { StreamsService } from "../../../Events";
import { Command } from "@becklyn/ddd";

export class NestStreamsCommandStore extends CommandStore {
    public constructor(
        private readonly tenantId: string,
        private readonly topic: string,
        private readonly streamsService: StreamsService
    ) {
        super();
    }

    public async append(command: Command): Promise<void> {
        const payload = JSON.parse(JSON.stringify(command));
        delete payload.id;
        delete payload.tenantId;
        delete payload._correlationId;
        delete payload._causationId;

        const commandToPublish: PublishEvent = {
            id: command.id.asString(),
            payload,
            tenantId: this.tenantId,
            type: command.constructor.name,
            stream: command.correlationId.asString(),
            correlationId: command.correlationId.asString(),
            causationId: command.causationId.asString(),
        };

        await this.streamsService.client.publish(this.topic, [commandToPublish]);
    }
}

export interface CommandStoreProviderOptions {
    tenantId: string;
    topic: string;
}

export const COMMAND_STORE_PROVIDER_OPTIONS = Symbol("COMMAND_STORE_PROVIDER_OPTIONS");
