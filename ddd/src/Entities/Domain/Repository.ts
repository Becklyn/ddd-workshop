import { AggregateId } from "../../Identity";
import { AggregateRoot } from "./AggregateRoot";
import { DomainEvent } from "../../Events";
import { Either } from "@becklyn/types";

export interface Repository<
    IdType extends AggregateId,
    AggregateRootType extends AggregateRoot<IdType, DomainEvent<IdType>>,
    AggregateRootNotFoundErrorType extends Error
> {
    nextId(): IdType;

    add(entity: AggregateRootType): Promise<void>;

    remove(entity: AggregateRootType): Promise<void>;

    findOneById(id: IdType): Promise<Either<AggregateRootNotFoundErrorType, AggregateRootType>>;
}
