import { CommandId } from "./CommandId";
import { Message } from "../../Messages/Domain/Message";
import { MessageId } from "../../Messages/Domain/MessageId";

export abstract class Command implements Message {
    public readonly id: CommandId;
    private _correlationId: MessageId;
    private _causationId: MessageId;

    protected constructor() {
        this.id = CommandId.next(CommandId);
        this._correlationId = this.id;
        this._causationId = this.id;
    }

    get correlationId(): MessageId {
        return this._correlationId;
    }

    get causationId(): MessageId {
        return this._causationId;
    }

    public correlateWith = (message: Message): void => {
        this._correlationId = message.correlationId;
        this._causationId = message.id;
    };
}
