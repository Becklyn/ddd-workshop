import { ContingentId } from "@EventOrganizing/Domain/Contingent/ContingentId";
import { Contingent } from "@EventOrganizing/Domain/Contingent/Contingent";
import { EventId } from "@EventOrganizing/Domain/EventId";

export interface ContingentRepository {
    nextId(): ContingentId;

    findOneById(id: ContingentId): Promise<Contingent>;

    findOneByEventId(id: EventId): Promise<Contingent>;
}

export abstract class AbstractContingentRepository implements ContingentRepository {
    public nextId(): ContingentId {
        return ContingentId.next(ContingentId);
    }

    public abstract findOneById(id: ContingentId): Promise<Contingent>;

    public abstract findOneByEventId(id: EventId): Promise<Contingent>;
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

    public static byEventId(id: EventId): ContingentNotFoundError {
        return new ContingentNotFoundError(
            `Could not find contingent belonging to event "${id.asString()}"`
        );
    }
}
