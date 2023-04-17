import { MessageId, MessageIdString } from "../../Messages";
import { Id } from "../../Identity";

export type CommandIdString = MessageIdString;

export class CommandId extends MessageId {
    public equals = (other: Id): boolean =>
        this.id === other.asString() &&
        (this.constructor === other.constructor || other.constructor === MessageId);
}
