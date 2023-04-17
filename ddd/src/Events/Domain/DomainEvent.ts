import { EventId, EventIdString } from "./EventId";
import { AggregateId, AggregateIdString } from "../../Identity";
import { MillisecondsSinceEpoch } from "@becklyn/types";
import { Message, MessageId, MessageIdString } from "../../Messages";

export abstract class DomainEvent<
    AggregateIdType extends AggregateId,
    OwnProps extends Record<string, any> = Record<string, any>
> implements Message
{
    public readonly data: {
        readonly id: EventIdString;
        correlationId: MessageIdString | null;
        causationId: MessageIdString | null;
        readonly raisedAt: MillisecondsSinceEpoch;
        readonly aggregateId: AggregateIdString;
    } & OwnProps;

    public constructor(
        id: EventId,
        raisedAt: Date,
        aggregateId: AggregateIdType,
        ownProps: OwnProps
    ) {
        this.validateOwnPropsArePrimitives(ownProps);

        this.data = {
            id: id.asString(),
            correlationId: null,
            causationId: null,
            raisedAt: raisedAt.getTime(),
            aggregateId: aggregateId.asString(),
            ...ownProps,
        };
    }

    private validateOwnPropsArePrimitives(ownProps: OwnProps): void {
        if (ownProps.constructor.name !== "Object") {
            throw new Error(
                `Object that is not a plain javascript object passed as own props to event of class '${this.constructor.name}' - only a plain javascript object with primitive props is allowed`
            );
        }

        Object.entries(ownProps).forEach(element =>
            this.validateValueIsPrimitive(element[1], `ownProps.${element[0]}`)
        );
    }

    private validateValueIsPrimitive(value: any, path: string): void {
        if (value === null) {
            return;
        }

        if (["string", "number", "bigint", "boolean"].includes(typeof value)) {
            return;
        }

        if (value instanceof Array) {
            value.forEach((element: any, index: number) =>
                this.validateValueIsPrimitive(element, `${path}[${index}]`)
            );

            return;
        }

        if (value.constructor.name === "Object") {
            Object.entries(value).forEach(element =>
                this.validateValueIsPrimitive(element[1], `${path}.${element[0]}`)
            );

            return;
        }

        throw new Error(
            `Property '${path}' passed as part of own props to event of class '${this.constructor.name}' is not a primitive!`
        );
    }

    public get id(): EventId {
        return EventId.fromString(EventId, this.data.id);
    }

    public get raisedAt(): Date {
        return new Date(this.data.raisedAt);
    }

    public get aggregateType(): string {
        return this.aggregateId.aggregateType;
    }

    public abstract get aggregateId(): AggregateIdType;

    public get correlationId(): MessageId {
        if (this.data.correlationId) {
            return MessageId.fromString(MessageId, this.data.correlationId);
        }

        throw new Error(
            "Attempted to call DomainEvent.correlationId before the event was correlated"
        );
    }

    public get causationId(): MessageId {
        if (this.data.causationId) {
            return MessageId.fromString(MessageId, this.data.causationId);
        }

        throw new Error(
            "Attempted to call DomainEvent.causationId before the event was correlated"
        );
    }

    public correlateWith(message: Message): void {
        this.data.correlationId = message.correlationId.asString();
        this.data.causationId = message.id.asString();
    }
}
