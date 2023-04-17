import { DomainEvent } from "@becklyn/ddd";
import { ContingentId } from "@EventOrganizing/Domain/Contingent/ContingentId";

export abstract class ContingentEvent<
    OwnProps extends Record<string, any> = Record<string, any>
> extends DomainEvent<ContingentId, OwnProps> {
    get aggregateId(): ContingentId {
        return ContingentId.fromString(ContingentId, this.data.aggregateId);
    }
}
