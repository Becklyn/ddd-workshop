import {
    AbstractContingentRepository,
    ContingentNotFoundError,
} from "@EventOrganizing/Domain/Contingent/ContingentRepository";
import { Inject, Injectable } from "@nestjs/common";
import { ContingentId } from "@EventOrganizing/Domain/Contingent/ContingentId";
import { Contingent } from "@EventOrganizing/Domain/Contingent/Contingent";
import { EventStore } from "@becklyn/ddd-nest";
import { EventId } from "@EventOrganizing/Domain/EventId";
import { newDeliveryClient } from "@fraym/projections";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class FraymContingentRepository extends AbstractContingentRepository {
    public constructor(
        @Inject(EventStore)
        private readonly eventStore: EventStore,
        private readonly configService: ConfigService
    ) {
        super();
    }

    public async findOneById(id: ContingentId): Promise<Contingent> {
        const stream = await this.eventStore.getAggregateStream(id);

        if (stream.isEmpty) {
            throw ContingentNotFoundError.byContingentId(id);
        }

        return new Contingent(stream);
    }

    public async findOneByEventId(id: EventId): Promise<Contingent> {
        const tenantId = this.configService.get<string>("STREAMS_SERVICE_TENANT_ID");

        if (!tenantId) {
            throw new Error("'STREAMS_SERVICE_TENANT_ID' not defined in .env");
        }

        const projections = await (
            await newDeliveryClient()
        ).getDataList<{ contingentId: string }>("Contingent", {
            tenantId,
            scopes: ["FRAYM_AUTH_OWNER"],
            data: {},
        });

        if (!projections || projections.data.length === 0) {
            throw ContingentNotFoundError.byEventId(id);
        }

        if (projections.data.length > 1) {
            throw new Error(`More than one contingent found for event "${id.asString()}"`);
        }

        return await this.findOneById(
            ContingentId.fromString(ContingentId, projections.data[0].contingentId)
        );
    }
}
