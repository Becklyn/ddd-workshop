import { MessageId } from "./MessageId";

export interface Message {
    id: MessageId;
    correlationId: MessageId;
    causationId: MessageId;
    correlateWith(message: Message): void;
}
