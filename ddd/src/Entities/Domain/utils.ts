import { Entity } from "./Entity";
import { AggregateId, EntityId } from "../../Identity";
import { AggregateRoot } from "./AggregateRoot";
import { Optional } from "@becklyn/types";

export const findOneEntityById = <
    SubjectType extends Entity<any, any> | AggregateRoot<any, any>,
    IdType extends EntityId | AggregateId
>(
    subjects: SubjectType[],
    id: IdType
): Optional<SubjectType> => {
    const result = subjects.find((subject: SubjectType) => subject.id.equals(id));
    return Optional.fromValue(result);
};
