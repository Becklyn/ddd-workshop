import {
    DifferentTaxRatesWhileAddingPricesError,
    Price,
    TaxGreaterThanGrossPriceError,
    TaxHasDifferentCurrencyFromGrossPriceError,
} from "./Price";
import { Money } from "./Money";
import { EUR, USD } from "./Currency";

describe("Price", () => {
    describe("constructor", () => {
        it("throws TaxHasDifferentCurrencyFromGrossPriceError if tax amount has different currency than gross price", () => {
            expect(
                () =>
                    new Price(Money.fromCents(1, EUR), {
                        amount: Money.fromCents(1, USD),
                        percent: 0,
                    })
            ).toThrow(TaxHasDifferentCurrencyFromGrossPriceError);
        });

        it("throws TaxGreaterThanGrossPriceError if tax amount is greater than gross price", () => {
            expect(
                () =>
                    new Price(Money.fromCents(1, EUR), {
                        amount: Money.fromCents(2, EUR),
                        percent: 0,
                    })
            ).toThrow(TaxGreaterThanGrossPriceError);
        });
    });

    describe("net", () => {
        it("returns difference between gross and tax amount", () => {
            const grossCents = 100;
            const taxCents = 10;

            const price = new Price(Money.fromCents(grossCents, EUR), {
                amount: Money.fromCents(taxCents, EUR),
                percent: 0,
            });

            expect(price.net.equals(Money.fromCents(grossCents - taxCents, EUR))).toBeTruthy();
        });
    });

    describe("equals", () => {
        it("returns true if gross, tax amount and tax percent are equal", () => {
            const gross = Money.fromCents(100, EUR);
            const taxAmount = Money.fromCents(10, EUR);
            const taxPercent = 5;

            const price1 = new Price(gross, {
                amount: taxAmount,
                percent: taxPercent,
            });

            const price2 = new Price(gross, {
                amount: taxAmount,
                percent: taxPercent,
            });

            expect(price1.gross.equals(price2.gross)).toBeTruthy();
            expect(price1.tax.amount.equals(price2.tax.amount)).toBeTruthy();
            expect(price1.tax.percent).toEqual(price2.tax.percent);

            expect(price1.equals(price2)).toBeTruthy();
        });

        it("returns false if gross and tax amount are equal but tax percent is different", () => {
            const gross = Money.fromCents(100, EUR);
            const taxAmount = Money.fromCents(10, EUR);

            const price1 = new Price(gross, {
                amount: taxAmount,
                percent: 1,
            });

            const price2 = new Price(gross, {
                amount: taxAmount,
                percent: 2,
            });

            expect(price1.gross.equals(price2.gross)).toBeTruthy();
            expect(price1.tax.amount.equals(price2.tax.amount)).toBeTruthy();
            expect(price1.tax.percent).not.toEqual(price2.tax.percent);

            expect(price1.equals(price2)).toBeFalsy();
        });

        it("returns false if gross and tax percent are equal but tax amount is different", () => {
            const gross = Money.fromCents(100, EUR);
            const taxPercent = 5;

            const price1 = new Price(gross, {
                amount: Money.fromCents(10, EUR),
                percent: taxPercent,
            });

            const price2 = new Price(gross, {
                amount: Money.fromCents(20, EUR),
                percent: taxPercent,
            });

            expect(price1.gross.equals(price2.gross)).toBeTruthy();
            expect(price1.tax.percent).toEqual(price2.tax.percent);
            expect(price1.tax.amount.equals(price2.tax.amount)).toBeFalsy();

            expect(price1.equals(price2)).toBeFalsy();
        });

        it("returns false if tax amount and percent are equal but gross is different", () => {
            const taxAmount = Money.fromCents(10, EUR);
            const taxPercent = 5;

            const price1 = new Price(Money.fromCents(109, EUR), {
                amount: taxAmount,
                percent: taxPercent,
            });

            const price2 = new Price(Money.fromCents(200, EUR), {
                amount: taxAmount,
                percent: taxPercent,
            });

            expect(price1.tax.amount.equals(price2.tax.amount)).toBeTruthy();
            expect(price1.tax.percent).toEqual(price2.tax.percent);
            expect(price1.gross.equals(price2.gross)).toBeFalsy();

            expect(price1.equals(price2)).toBeFalsy();
        });
    });

    describe("add", () => {
        it("returns new instance where gross is sum of gross from all addends", () => {
            const gross1 = 100;
            const gross2 = 120;
            const gross3 = 180;

            const price1 = new Price(Money.fromCents(gross1, EUR), {
                amount: Money.fromCents(10, EUR),
                percent: 7,
            });
            const price2 = new Price(Money.fromCents(gross2, EUR), {
                amount: Money.fromCents(10, EUR),
                percent: 7,
            });
            const price3 = new Price(Money.fromCents(gross3, EUR), {
                amount: Money.fromCents(10, EUR),
                percent: 7,
            });

            expect(price1.add(price2, price3).gross.amount).toEqual(gross1 + gross2 + gross3);
        });

        it("returns new instance where tax amount is sum of tax amounts from all addends", () => {
            const taxAmount1 = 10;
            const taxAmount2 = 12;
            const taxAmount3 = 16;

            const price1 = new Price(Money.fromCents(100, EUR), {
                amount: Money.fromCents(taxAmount1, EUR),
                percent: 7,
            });
            const price2 = new Price(Money.fromCents(100, EUR), {
                amount: Money.fromCents(taxAmount2, EUR),
                percent: 7,
            });
            const price3 = new Price(Money.fromCents(100, EUR), {
                amount: Money.fromCents(taxAmount3, EUR),
                percent: 7,
            });

            expect(price1.add(price2, price3).tax.amount.amount).toEqual(
                taxAmount1 + taxAmount2 + taxAmount3
            );
        });

        it("returns new instance where tax percent is equal to tax percent of addends", () => {
            const taxPercent = 5;

            const price1 = new Price(Money.fromCents(100, EUR), {
                amount: Money.fromCents(12, EUR),
                percent: taxPercent,
            });
            const price2 = new Price(Money.fromCents(100, EUR), {
                amount: Money.fromCents(13, EUR),
                percent: taxPercent,
            });
            const price3 = new Price(Money.fromCents(100, EUR), {
                amount: Money.fromCents(14, EUR),
                percent: taxPercent,
            });

            expect(price1.add(price2, price3).tax.percent).toEqual(taxPercent);
        });

        it("throws DifferentTaxRatesWhileAddingPricesError if not all addends have same tax rate", () => {
            const price1 = new Price(Money.fromCents(100, EUR), {
                amount: Money.fromCents(12, EUR),
                percent: 5,
            });
            const price2 = new Price(Money.fromCents(100, EUR), {
                amount: Money.fromCents(13, EUR),
                percent: 7,
            });

            expect(() => price1.add(price2)).toThrow(DifferentTaxRatesWhileAddingPricesError);
        });
    });

    describe("toJSON", () => {
        it("returns JSON representation of Price object", () => {
            const grossCents = 100;
            const taxCents = 10;
            const taxPercent = 5;

            const price = new Price(Money.fromCents(grossCents, EUR), {
                amount: Money.fromCents(taxCents, EUR),
                percent: taxPercent,
            });

            expect(price.toJSON()).toEqual({
                gross: {
                    amount: grossCents,
                    scale: 2,
                    currency: EUR.toJSON(),
                },
                tax: {
                    amount: {
                        amount: taxCents,
                        scale: 2,
                        currency: EUR.toJSON(),
                    },
                    percent: taxPercent,
                },
            });
        });
    });

    describe("fromJSON", () => {
        it("returns Price object from JSON representation", () => {
            const grossCents = 100;
            const taxCents = 10;
            const taxPercent = 5;

            const price = Price.fromJSON({
                gross: {
                    amount: grossCents,
                    scale: 2,
                    currency: EUR.toJSON(),
                },
                tax: {
                    amount: {
                        amount: taxCents,
                        scale: 2,
                        currency: EUR.toJSON(),
                    },
                    percent: taxPercent,
                },
            });

            expect(price.gross.amount).toEqual(grossCents);
            expect(price.gross.scale).toEqual(2);
            expect(price.gross.currency.equals(EUR)).toBeTruthy();
            expect(price.tax.amount.amount).toEqual(taxCents);
            expect(price.tax.amount.scale).toEqual(2);
            expect(price.tax.amount.currency.equals(EUR)).toBeTruthy();
            expect(price.tax.percent).toEqual(taxPercent);
        });
    });
});
