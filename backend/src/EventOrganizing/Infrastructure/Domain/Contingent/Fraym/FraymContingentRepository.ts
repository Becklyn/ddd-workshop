import {
    AbstractContingentRepository,
    ContingentNotFoundError,
} from "@EventOrganizing/Domain/Contingent/ContingentRepository";
import { Inject, Injectable } from "@nestjs/common";
import { ContingentId } from "@EventOrganizing/Domain/Contingent/ContingentId";
import { Contingent } from "@EventOrganizing/Domain/Contingent/Contingent";
import { EventStore } from "@becklyn/ddd-nest";

@Injectable()
export class FraymContingentRepository extends AbstractContingentRepository {
    public constructor(
        @Inject(EventStore)
        private readonly eventStore: EventStore
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
}
