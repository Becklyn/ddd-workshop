import { Money, MoneyJson } from "./Money";
import { PositiveIntegerOrZero } from "@becklyn/types";

export class Price {
    public constructor(
        public readonly gross: Money,
        public readonly tax: { readonly amount: Money; percent: PositiveIntegerOrZero }
    ) {
        if (!gross.currency.equals(tax.amount.currency)) {
            throw new TaxHasDifferentCurrencyFromGrossPriceError(gross, tax.amount);
        }

        if (tax.amount.isGreaterThan(gross)) {
            throw new TaxGreaterThanGrossPriceError(gross, tax.amount);
        }
    }

    public get net(): Money {
        return this.gross.subtract(this.tax.amount);
    }

    public equals = (other: Price): boolean =>
        this.gross.equals(other.gross) &&
        this.tax.amount.equals(other.tax.amount) &&
        this.tax.percent === other.tax.percent;

    public add = (...addends: Price[]): Price => {
        const firstTaxPercent = this.tax.percent;
        addends.forEach(addend => {
            if (addend.tax.percent !== firstTaxPercent) {
                throw new DifferentTaxRatesWhileAddingPricesError(
                    firstTaxPercent,
                    addend.tax.percent
                );
            }
        });

        return new Price(this.gross.add(...addends.map(addend => addend.gross)), {
            amount: this.tax.amount.add(...addends.map(addend => addend.tax.amount)),
            percent: firstTaxPercent,
        });
    };

    public toJSON = (): PriceJson => ({
        gross: this.gross.toJSON(),
        tax: { amount: this.tax.amount.toJSON(), percent: this.tax.percent },
    });

    public static fromJSON = (json: PriceJson): Price =>
        new Price(Money.fromJSON(json.gross), {
            amount: Money.fromJSON(json.tax.amount),
            percent: json.tax.percent,
        });
}

export class TaxHasDifferentCurrencyFromGrossPriceError extends Error {
    public constructor(gross: Money, taxAmount: Money) {
        super(
            `Tax amount ${taxAmount.amount} (scale ${taxAmount.scale}, currency ${taxAmount.currency.code}) has different currency than gross price ${gross.amount} (scale ${gross.scale}, currency ${gross.currency.code})`
        );
    }
}

export class TaxGreaterThanGrossPriceError extends Error {
    public constructor(gross: Money, taxAmount: Money) {
        super(
            `Tax amount ${taxAmount.amount} (scale ${taxAmount.scale}) is greater than gross price ${gross.amount} (scale ${gross.scale})`
        );
    }
}

export class DifferentTaxRatesWhileAddingPricesError extends Error {
    public constructor(firstTaxRate: PositiveIntegerOrZero, secondTaxRate: PositiveIntegerOrZero) {
        super(`Cannot add prices with different tax rates: ${firstTaxRate} and ${secondTaxRate}`);
    }
}

export type PriceJson = {
    gross: MoneyJson;
    tax: { amount: MoneyJson; percent: PositiveIntegerOrZero };
};
