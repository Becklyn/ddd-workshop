import { Injectable } from "@nestjs/common";
import { EventId } from "@EventOrganizing/Domain/EventId";
import { ContingentId } from "@EventOrganizing/Domain/Contingent/ContingentId";
import { Optional, OptionalValue, PositiveInteger, PositiveIntegerOrZero } from "@becklyn/types";
import { ConfigService } from "@nestjs/config";
import { newDeliveryClient } from "@fraym/projections";

@Injectable()
export class GetContingentDataForEvent {
    public constructor(private readonly configService: ConfigService) {}

    public async execute(eventId: EventId): Promise<
        Optional<{
            contingentId: ContingentId;
            eventId: EventId;
            quantity: Optional<PositiveInteger>;
            soldQuantity: PositiveIntegerOrZero;
        }>
    > {
        const tenantId = this.configService.get<string>("STREAMS_SERVICE_TENANT_ID");

        if (!tenantId) {
            throw new Error("'STREAMS_SERVICE_TENANT_ID' not defined in .env");
        }

        const projections = await (
            await newDeliveryClient()
        ).getDataList<{
            contingentId: string;
            quantity: OptionalValue<PositiveInteger>;
            soldQuantity: PositiveIntegerOrZero;
        }>("Contingent", {
            tenantId,
            scopes: ["FRAYM_AUTH_OWNER"],
            data: {},
        });

        if (!projections || projections.data.length === 0) {
            return Optional.null();
        }

        if (projections.data.length > 1) {
            throw new Error(`More than one contingent found for event "${eventId.asString()}"`);
        }

        return Optional.fromValue({
            contingentId: ContingentId.fromString(ContingentId, projections.data[0].contingentId),
            eventId: EventId.fromString(EventId, projections.data[0].contingentId),
            quantity: Optional.fromValue(projections.data[0].quantity),
            soldQuantity: projections.data[0].soldQuantity,
        });
    }
}
