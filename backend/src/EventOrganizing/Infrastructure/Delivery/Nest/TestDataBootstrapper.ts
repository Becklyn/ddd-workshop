import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { newDeliveryClient } from "@fraym/crud";

@Injectable()
export class TestDataBootstrapper implements OnApplicationBootstrap {
    public constructor(private readonly configService: ConfigService) {}

    public async onApplicationBootstrap(): Promise<void> {
        const tenantId = this.configService.get<string>("STREAMS_SERVICE_TENANT_ID");

        if (!tenantId) {
            throw new Error("'STREAMS_SERVICE_TENANT_ID' not defined in .env");
        }

        const eventId = "8427aa9d-c520-40be-845d-20f0a106df2e";
        const ticketType1Id = "43b3c5e2-266a-457b-b1d0-1b8d8afc65ce";
        const ticketType2Id = "77ea0765-1fd4-441d-a0cc-a62683d38a98";

        const crud = await newDeliveryClient();
        const authData = {
            tenantId,
            scopes: ["FRAYM_AUTH_OWNER"],
            data: {},
        };

        const existingEvent = await crud.getData<{
            name: string;
            location: string;
            timestampStart: number;
            timestampEnd: number;
            description: string | null;
        }>("Event", authData, eventId);

        if (existingEvent) {
            return;
        }

        console.log("Creating test event and ticket types...");

        await crud.create(
            "Event",
            authData,
            {
                name: "Iron Maiden 2023 Summer Tour",
                location: "MHP Arena Ludwigsburg",
                timestampStart: 1688317200,
                timestampEnd: 1688335200,
                description: "Iron Maiden plays in Ludwigsburg",
            },
            eventId
        );

        await crud.create(
            "EventTicketType",
            authData,
            {
                event: eventId,
                name: "Regular",
                price: 50,
                description: "Regular ticket",
            },
            ticketType1Id
        );

        await crud.create(
            "EventTicketType",
            authData,
            {
                event: eventId,
                name: "VIP",
                price: 400,
                description:
                    "VIP ticket with access to VIP lounge and autograph session with the band",
            },
            ticketType2Id
        );

        console.log("Created test event and ticket types");
    }
}
