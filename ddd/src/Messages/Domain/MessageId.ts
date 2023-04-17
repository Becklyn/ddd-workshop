import { Id, IdString } from "../../Identity/Domain/Id";

export type MessageIdString = IdString;

export class MessageId extends Id {
    public equals = (other: Id): boolean =>
        this.id === other.asString() && other instanceof MessageId;
}
