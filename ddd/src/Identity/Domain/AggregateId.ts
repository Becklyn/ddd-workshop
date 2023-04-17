import { EntityId, EntityIdString } from "./EntityId";

export type AggregateIdString = EntityIdString;

export abstract class AggregateId extends EntityId {
    public get aggregateType(): string {
        return this.constructor.name.substring(0, this.constructor.name.length - 2);
    }
}
