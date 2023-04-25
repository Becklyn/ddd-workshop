import { ContingentId } from "@EventOrganizing/Domain/Contingent/ContingentId";
import {
    assertPositiveInteger,
    Optional,
    PositiveInteger,
    PositiveIntegerOrZero,
} from "@becklyn/types";
import { AggregateEventStream, AggregateRoot } from "@becklyn/ddd";
import { ContingentEvent } from "@EventOrganizing/Domain/Contingent/ContingentEvent";
import { EventId } from "@EventOrganizing/Domain/EventId";
import { ContingentInitialized } from "@EventOrganizing/Domain/Contingent/ContingentInitialized";
import { ContingentIncreased } from "@EventOrganizing/Domain/Contingent/ContingentIncreased";
import { ContingentReduced } from "@EventOrganizing/Domain/Contingent/ContingentReduced";
import { ContingentSetToUnlimited } from "@EventOrganizing/Domain/Contingent/ContingentSetToUnlimited";
import { ContingentLimited } from "@EventOrganizing/Domain/Contingent/ContingentLimited";
import { ContingentSold } from "@EventOrganizing/Domain/Contingent/ContingentSold";

export class Contingent extends AggregateRoot<
    ContingentId,
    ContingentEvent,
    { eventId: EventId; quantity: Optional<PositiveInteger>; soldQuantity: PositiveIntegerOrZero }
> {
    public get isUnlimited(): boolean {
        return this.state.quantity.isNull();
    }

    public get isLimited(): boolean {
        return this.state.quantity.isNotNull();
    }

    public get availableQuantity(): Optional<PositiveIntegerOrZero> {
        return this.state.quantity.map(quantity => quantity - this.state.soldQuantity);
    }

    public static initialize = (
        id: ContingentId,
        eventId: EventId,
        quantity: Optional<PositiveInteger>
    ): Contingent => {
        if (quantity.isNotNull()) {
            assertPositiveInteger(quantity.value!, "Quantity");
        }

        const initialized = new ContingentInitialized(Contingent.nextEventId(), new Date(), id, {
            eventId: eventId.asString(),
            quantity: quantity.value,
        });

        const self = new Contingent(new AggregateEventStream(id, [initialized]));

        self.events.raiseEvent(initialized);

        return self;
    };

    protected applyContingentInitialized(event: ContingentInitialized): void {
        this.state = {
            id: event.aggregateId,
            createdAt: event.raisedAt,
            eventId: event.eventId,
            quantity: event.quantity,
            soldQuantity: 0,
        };
    }

    public increase(quantity: PositiveInteger): void {
        if (this.isUnlimited) {
            throw new IncreaseUnlimitedContingentError(this.id);
        } else {
            assertPositiveInteger(quantity, "Quantity");
        }

        const increased = new ContingentIncreased(Contingent.nextEventId(), new Date(), this.id, {
            quantity,
        });

        this.raiseAndApply(increased);
    }

    protected applyContingentIncreased(event: ContingentIncreased): void {
        this.state.quantity = this.state.quantity.map(quantity => quantity + event.quantity);
    }

    public reduce(quantity: PositiveInteger): void {
        if (this.isUnlimited) {
            throw new ReduceUnlimitedContingentError(this.id);
        } else {
            assertPositiveInteger(quantity, "Quantity");
        }

        const reducedQuantity = this.state.quantity.value! - quantity;

        if (reducedQuantity <= 0) {
            this.setToUnlimited();
            return;
        }

        const reduced = new ContingentReduced(Contingent.nextEventId(), new Date(), this.id, {
            quantity,
        });

        this.raiseAndApply(reduced);
    }

    protected applyContingentReduced(event: ContingentReduced): void {
        this.state.quantity = this.state.quantity.map(quantity => quantity - event.quantity);
    }

    public setToUnlimited(): void {
        if (this.isUnlimited) {
            return;
        }

        this.raiseAndApply(
            new ContingentSetToUnlimited(Contingent.nextEventId(), new Date(), this.id, {})
        );
    }

    protected applyContingentSetToUnlimited(event: ContingentSetToUnlimited): void {
        event;
        this.state.quantity = Optional.null();
    }

    public limit(quantity: PositiveInteger): void {
        if (this.isLimited) {
            throw new ContingentAlreadyLimitedError(this.id, quantity);
        } else {
            assertPositiveInteger(quantity, "Quantity");
        }

        this.raiseAndApply(
            new ContingentLimited(Contingent.nextEventId(), new Date(), this.id, {
                quantity: quantity,
            })
        );
    }

    protected applyContingentLimited(event: ContingentLimited): void {
        this.state.quantity = Optional.fromValue(event.quantity);
    }

    public sell(quantity: PositiveInteger): void {
        assertPositiveInteger(quantity, "Quantity");

        if (this.availableQuantity.isNotNull() && this.availableQuantity.value! < quantity) {
            throw new NotEnoughContingentToSellError(
                this.id,
                quantity,
                this.availableQuantity.value!
            );
        }

        this.raiseAndApply(
            new ContingentSold(Contingent.nextEventId(), new Date(), this.id, {
                quantity,
            })
        );
    }

    protected applyContingentSold(event: ContingentSold): void {
        this.state.soldQuantity += event.quantity;
    }
}

export class IncreaseUnlimitedContingentError extends Error {
    public constructor(id: ContingentId) {
        super(`Could not increase quantity of unlimited contingent "${id.asString()}"`);
    }
}

export class ReduceUnlimitedContingentError extends Error {
    public constructor(id: ContingentId) {
        super(`Could not reduce quantity of unlimited contingent "${id.asString()}"`);
    }
}

export class ContingentAlreadyLimitedError extends Error {
    public constructor(id: ContingentId, contingentQuantity: PositiveInteger) {
        super(
            `Could not set quantity of unlimited contingent "${id.asString()}" to "${contingentQuantity}" because it is already limited; you must either increase or reduce it instead.`
        );
    }
}

export class NotEnoughContingentToSellError extends Error {
    public constructor(
        id: ContingentId,
        quantity: PositiveInteger,
        availableQuantity: PositiveInteger
    ) {
        super(
            `Could not sell ${quantity} of contingent "${id.asString()}" because there are only ${availableQuantity} left.`
        );
    }
}
