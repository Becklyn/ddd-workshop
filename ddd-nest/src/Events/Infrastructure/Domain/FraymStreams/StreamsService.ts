import { newClient, Client } from "@fraym/streams";
import { OnApplicationShutdown } from "@nestjs/common";
export class StreamsService implements OnApplicationShutdown {
    private readonly dedicatedClients: Client[] = [];

    private constructor(
        private readonly serviceClient: Client,
        private readonly serverAddress: string,
        private readonly groupId: string,
        private readonly ackTimeout: number
    ) {}

    public static async initialize({
        serverAddress,
        groupId = "ddd-backend",
        ackTimeout = 1000,
    }: StreamsServiceOptions): Promise<StreamsService> {
        const client = await newClient({
            serverAddress,
            groupId,
            ackTimeout,
        });

        return new StreamsService(client, serverAddress, groupId, ackTimeout);
    }

    public get client(): Client {
        return this.serviceClient;
    }

    public async createDedicatedClient(): Promise<Client> {
        const client = await newClient({
            serverAddress: this.serverAddress,
            groupId: this.groupId,
            ackTimeout: this.ackTimeout,
        });

        this.dedicatedClients.push(client);

        return client;
    }

    public onApplicationShutdown(signal?: string | undefined) {
        signal;
        this.client.close();
        for (const client of this.dedicatedClients) {
            client.close();
        }
    }
}

export interface StreamsServiceOptions {
    serverAddress: string;
    groupId?: string;
    ackTimeout?: number;
}

export const STREAMS_SERVICE_PROVIDER_OPTIONS = Symbol("STREAMS_SERVICE_PROVIDER_OPTIONS");
