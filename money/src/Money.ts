import { Currency, CurrencyJson } from "./Currency";
import {
    assertPositiveInteger,
    assertPositiveIntegerOrZero,
    PositiveInteger,
    PositiveIntegerOrZero,
} from "@becklyn/types";
import {
    add,
    allocate,
    Dinero,
    equal,
    greaterThan,
    greaterThanOrEqual,
    isZero,
    lessThan,
    lessThanOrEqual,
    multiply,
    subtract,
    trimScale,
} from "dinero.js";
import { moneyAsDinero } from "./dinero-utils";

type ScaledPositiveAmountOrZero = {
    amount: PositiveIntegerOrZero;
    scale: PositiveInteger;
};

const hasScaledPositiveAmountOrZeroShape = (obj: any): obj is ScaledPositiveAmountOrZero =>
    typeof obj === "object" && "amount" in obj && "scale" in obj;

const assertScaledPositiveAmountOrZero: any = (
    obj: ScaledPositiveAmountOrZero
): asserts obj is ScaledPositiveAmountOrZero => {
    if (!hasScaledPositiveAmountOrZeroShape(obj)) {
        throw new TypeError("Object does not extend the ScaledPositiveAmountOrZero type");
    }

    try {
        assertPositiveIntegerOrZero(obj.amount);
    } catch (e) {
        throw new TypeError(
            `Object has the shape of the ScaledPositiveAmountOrZero type but its amount '${obj.amount}' is not a positive integer`
        );
    }

    try {
        assertPositiveInteger(obj.scale);
    } catch (e) {
        throw new TypeError(
            `Object has the shape of the ScaledPositiveAmountOrZero type but its scale '${obj.scale}' is not a positive integer`
        );
    }
};

export class Money {
    protected constructor(
        public readonly amount: PositiveIntegerOrZero,
        public readonly currency: Currency,
        public readonly scale: PositiveIntegerOrZero = 2
    ) {
        assertPositiveIntegerOrZero(amount, "Money amount");
        assertPositiveIntegerOrZero(scale, "Money scale");
    }

    public static fromAmount = (
        amount: PositiveIntegerOrZero,
        currency: Currency,
        scale: PositiveIntegerOrZero
    ): Money => new Money(amount, currency, scale);

    public static fromCents = (amountCents: PositiveIntegerOrZero, currency: Currency): Money =>
        new Money(amountCents, currency);

    public add = (...addends: Money[]): Money => {
        this.assertSameCurrency("add", ...addends);

        const dineroResult = addends.reduce(
            (sum, current) => add(sum, moneyAsDinero(current)),
            moneyAsDinero(this)
        );

        return this.fromDinero(dineroResult);
    };

    private fromDinero = (dinero: Dinero<number>): Money => {
        const { amount, scale } = dinero.toJSON();
        return new Money(amount, this.currency, scale);
    };

    private assertSameCurrency(operation: string, ...operands: Money[]) {
        operands.forEach(operand => {
            if (!this.currency.equals(operand.currency)) {
                throw new CurrencyMismatchError(
                    `Attempted to perform the '${operation}' operation on ${JSON.stringify(
                        operand
                    )} and ${JSON.stringify(this)} but their currencies are different`
                );
            }
        });
    }

    public subtract = (...subtrahends: Money[]): Money => {
        this.assertSameCurrency("subtract", ...subtrahends);

        const moneyToSubtract = subtrahends.reduce((sum, current) => sum.add(current));

        if (this.isLesserThan(moneyToSubtract)) {
            throw new NegativeSubtractionResultError(
                `Attempted to subtract ${JSON.stringify(moneyToSubtract)} from ${JSON.stringify(
                    this
                )} which would result in negative money - this is not allowed!`
            );
        }

        const dineroResult = subtract(moneyAsDinero(this), moneyAsDinero(moneyToSubtract));

        return this.fromDinero(dineroResult);
    };

    public multiply = (factor: PositiveIntegerOrZero | ScaledPositiveAmountOrZero): Money => {
        if (hasScaledPositiveAmountOrZeroShape(factor)) {
            assertScaledPositiveAmountOrZero(factor);

            if (factor.amount === 0) {
                return new Money(0, this.currency, this.scale);
            }
        } else {
            assertPositiveIntegerOrZero(factor);

            if (factor === 0) {
                return new Money(0, this.currency, this.scale);
            }
        }

        const dineroResult = multiply(moneyAsDinero(this), factor);

        return this.fromDinero(dineroResult);
    };

    public allocate = (percentagesOrRatios: PositiveInteger[]): Money[] => {
        if (percentagesOrRatios.length === 0) {
            return [this];
        }

        return allocate(moneyAsDinero(this), percentagesOrRatios).map(dineroBucket =>
            this.fromDinero(dineroBucket)
        );
    };

    public equals = (other: Money): boolean => equal(moneyAsDinero(this), moneyAsDinero(other));

    public isGreaterThan = (other: Money): boolean => {
        this.assertSameCurrency("isGreaterThan", other);
        return greaterThan(moneyAsDinero(this), moneyAsDinero(other));
    };

    public isLesserThan = (other: Money): boolean => {
        this.assertSameCurrency("isLesserThan", other);
        return lessThan(moneyAsDinero(this), moneyAsDinero(other));
    };

    public isGreaterThanOrEqual = (other: Money): boolean => {
        this.assertSameCurrency("isGreaterThanOrEqual", other);
        return greaterThanOrEqual(moneyAsDinero(this), moneyAsDinero(other));
    };

    public isLesserThanOrEqual = (other: Money): boolean => {
        this.assertSameCurrency("isLesserThanOrEqual", other);
        return lessThanOrEqual(moneyAsDinero(this), moneyAsDinero(other));
    };

    public isZero = (): boolean => isZero(moneyAsDinero(this));

    public isNotZero = (): boolean => !isZero(moneyAsDinero(this));

    public trimScale = (): Money =>
        this.amount === 0
            ? Money.fromCents(0, this.currency)
            : this.fromDinero(trimScale(moneyAsDinero(this)));

    public roundToCents = (): Money => {
        const trimmed = this.trimScale();

        if (this.amount === 0) {
            return trimmed;
        }

        if (trimmed.scale > 2) {
            const divideWithPower = trimmed.scale - 2;
            const newAmount = Math.round(trimmed.amount / Math.pow(10, divideWithPower));
            return Money.fromCents(newAmount, this.currency);
        }

        return trimmed;
    };

    public toJSON = (): MoneyJson => ({
        amount: this.amount,
        currency: this.currency.toJSON(),
        scale: this.scale,
    });

    public static fromJSON = (json: MoneyJson): Money => {
        const currency = Currency.fromJSON(json.currency);
        return Money.fromAmount(json.amount, currency, json.scale);
    };
}

export type MoneyJson = {
    amount: PositiveIntegerOrZero;
    currency: CurrencyJson;
    scale: PositiveIntegerOrZero;
};

export class CurrencyMismatchError extends TypeError {}

export class NegativeSubtractionResultError extends Error {}
