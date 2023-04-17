import { ContingentId } from "@EventOrganizing/Domain/Contingent/ContingentId";
import { Contingent } from "@EventOrganizing/Domain/Contingent/Contingent";

export interface ContingentRepository {
    nextId(): ContingentId;

    findOneById(id: ContingentId): Promise<Contingent>;
}

export abstract class AbstractContingentRepository implements ContingentRepository {
    public nextId(): ContingentId {
        return ContingentId.next(ContingentId);
    }

    public abstract findOneById(id: ContingentId): Promise<Contingent>;
}

export const ContingentRepository = Symbol("ContingentRepository");

export class ContingentNotFoundError extends Error {
    private constructor(message: string) {
        super(message);
    }

    public static byContingentId(id: ContingentId): ContingentNotFoundError {
        return new ContingentNotFoundError(
            `Could not find contingent entity with id "${id.asString()}"`
        );
    }
}
