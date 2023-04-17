import { MessageId, MessageIdString } from "../../Messages";
import { Id } from "../../Identity";

export type EventIdString = MessageIdString;

export class EventId extends MessageId {
    public equals = (other: Id): boolean =>
        this.id === other.asString() &&
        (this.constructor === other.constructor || other.constructor === MessageId);
}
