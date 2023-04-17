import { EUR, USD } from "./Currency";
import { CurrencyMismatchError, Money, NegativeSubtractionResultError } from "./Money";

describe("Money", () => {
    describe("fromAmount", () => {
        it("returns Money object with given properties", () => {
            const amount = 99;
            const currency = USD;
            const scale = 2;

            const result = Money.fromAmount(amount, currency, scale);

            expect(result.amount).toBe(amount);
            expect(result.currency).toBe(currency);
            expect(result.scale).toBe(scale);
        });

        it("throws TypeError if amount is negative", () => {
            expect(() => Money.fromAmount(-1, USD, 2)).toThrow(TypeError);
        });

        it("throws TypeError if amount is not an integer", () => {
            expect(() => Money.fromAmount(2.5, USD, 2)).toThrow(TypeError);
        });

        it("throws TypeError if scale is negative", () => {
            expect(() => Money.fromAmount(1, USD, -1)).toThrow(TypeError);
        });

        it("throws TypeError if scale is not an integer", () => {
            expect(() => Money.fromAmount(1, USD, 2.5)).toThrow(TypeError);
        });
    });

    describe("fromCents", () => {
        it("returns Money object with given properties and scale 2", () => {
            const amount = 99;
            const currency = USD;

            const result = Money.fromCents(amount, currency);

            expect(result.amount).toBe(amount);
            expect(result.currency).toBe(currency);
            expect(result.scale).toBe(2);
        });

        it("throws TypeError if amount is negative", () => {
            expect(() => Money.fromCents(-1, USD)).toThrow(TypeError);
        });

        it("throws TypeError if amount is not an integer", () => {
            expect(() => Money.fromCents(2.5, USD)).toThrow(TypeError);
        });
    });

    describe("add", () => {
        describe("returns sum of two Money objects", () => {
            it("with shared scale", () => {
                const first = Money.fromCents(1, USD);
                const second = Money.fromCents(2, USD);

                const result = first.add(second);

                expect(result.amount).toBe(first.amount + second.amount);
                expect(result.currency).toBe(first.currency);
                expect(result.currency).toBe(second.currency);
                expect(result.scale).toBe(first.scale);
                expect(result.scale).toBe(second.scale);
            });

            it("with different scales at the finer of the two", () => {
                const first = Money.fromAmount(1, USD, 2);
                const second = Money.fromAmount(2, USD, 3);

                const result = first.add(second);

                expect(result.amount).toBe(first.amount * 10 + second.amount);
                expect(result.currency).toBe(first.currency);
                expect(result.currency).toBe(second.currency);
                expect(result.scale).not.toBe(first.scale);
                expect(result.scale).toBe(second.scale);
            });
        });

        it("can take multiple addends", () => {
            const first = Money.fromCents(1, USD);
            const second = Money.fromCents(2, USD);
            const third = Money.fromCents(3, USD);

            const result = first.add(second, third);

            expect(result.amount).toBe(first.amount + second.amount + third.amount);
        });

        it("throws CurrencyMismatchError if addends are of a different currency", () => {
            const first = Money.fromCents(1, USD);
            const second = Money.fromCents(2, EUR);

            expect(() => first.add(second)).toThrow(CurrencyMismatchError);
        });
    });

    describe("subtract", () => {
        describe("returns remaining money after two objects are subtracted", () => {
            it("with shared scale", () => {
                const first = Money.fromCents(3, USD);
                const second = Money.fromCents(1, USD);

                const result = first.subtract(second);

                expect(result.amount).toBe(first.amount - second.amount);
                expect(result.currency).toBe(first.currency);
                expect(result.currency).toBe(second.currency);
                expect(result.scale).toBe(first.scale);
                expect(result.scale).toBe(second.scale);
            });

            it("with different scales at the finer of the two", () => {
                const first = Money.fromAmount(1, USD, 2);
                const second = Money.fromAmount(1, USD, 3);

                const result = first.subtract(second);

                expect(result.amount).toBe(first.amount * 10 - second.amount);
                expect(result.currency).toBe(first.currency);
                expect(result.currency).toBe(second.currency);
                expect(result.scale).not.toBe(first.scale);
                expect(result.scale).toBe(second.scale);
            });
        });

        it("can take multiple subtrahends", () => {
            const first = Money.fromCents(8, USD);
            const second = Money.fromCents(1, USD);
            const third = Money.fromCents(2, USD);

            const result = first.subtract(second, third);

            expect(result.amount).toBe(first.amount - second.amount - third.amount);
        });

        it("throws CurrencyMismatchError if subtrahends are of a different currency", () => {
            const first = Money.fromCents(3, USD);
            const second = Money.fromCents(1, EUR);

            expect(() => first.subtract(second)).toThrow(CurrencyMismatchError);
        });

        it("throws NegativeSubtractionResultError if larger object is subtracted from smaller one", () => {
            const first = Money.fromCents(1, USD);
            const second = Money.fromCents(3, USD);

            expect(() => first.subtract(second)).toThrow(NegativeSubtractionResultError);
        });
    });

    describe("multiply", () => {
        describe("returns amount from initial object multiplied by given factor", () => {
            it("at same scale as initial object for integer factor", () => {
                const money = Money.fromCents(5, USD);
                const factor = 2;

                const result = money.multiply(factor);

                expect(result.amount).toBe(money.amount * factor);
                expect(result.currency).toBe(money.currency);
                expect(result.scale).toBe(money.scale);
            });

            it("at the sum of initial object and factor scales for scaled amount factor", () => {
                const money = Money.fromCents(400000, USD);
                const factor = { amount: 2000, scale: 3 };

                const result = money.multiply(factor);

                expect(result.amount).toBe(money.amount * factor.amount);
                expect(result.currency).toBe(money.currency);
                expect(result.scale).toBe(money.scale + factor.scale);
            });
        });

        describe("returns zero when multiplying with zero", () => {
            it("as primitive factor", () => {
                const money = Money.fromCents(5, USD);

                const result = money.multiply(0);

                expect(result.amount).toBe(0);
            });

            it("as scaled amount factor", () => {
                const money = Money.fromCents(5, USD);

                const result = money.multiply({ amount: 0, scale: 1 });

                expect(result.amount).toBe(0);
            });
        });

        describe("throws TypeError if decimal number is given", () => {
            it("for primitive factor", () => {
                const money = Money.fromCents(5, USD);
                const factor = 0.5;

                expect(() => money.multiply(factor)).toThrow(TypeError);
            });

            it("for scaled amount factor", () => {
                const money = Money.fromCents(5, USD);
                const factor = { amount: 50.5, scale: 1 };

                expect(() => money.multiply(factor)).toThrow(TypeError);
            });

            it("for scaled amount scale", () => {
                const money = Money.fromCents(5, USD);
                const factor = { amount: 50, scale: 1.5 };

                expect(() => money.multiply(factor)).toThrow(TypeError);
            });
        });

        describe("throws TypeError if negative factor is given", () => {
            it("for primitive factor", () => {
                const money = Money.fromCents(5, USD);
                const factor = -5;

                expect(() => money.multiply(factor)).toThrow(TypeError);
            });
            it("for scaled amount factor", () => {
                const money = Money.fromCents(5, USD);
                const factor = { amount: -5, scale: 1 };

                expect(() => money.multiply(factor)).toThrow(TypeError);
            });
        });
    });

    describe("allocate", () => {
        describe("if given a set of percentages", () => {
            describe("divides money into buckets", () => {
                it("of same scale with expected amounts", () => {
                    const money = Money.fromCents(100, USD);
                    const percentages = [25, 75];

                    const result = money.allocate(percentages);

                    expect(result.length).toBe(2);
                    expect(
                        result.find(bucket => bucket.amount === 25 && bucket.scale === 2)
                    ).toBeTruthy();
                    expect(
                        result.find(bucket => bucket.amount === 75 && bucket.scale === 2)
                    ).toBeTruthy();
                });

                it("so that the sum of all bucket amounts is always equal to the original amount", () => {
                    const money = Money.fromCents(29, USD);
                    const percentages = [13, 87];

                    const result = money.allocate(percentages);

                    expect(result.reduce((sum, current) => sum + current.amount, 0)).toBe(
                        money.amount
                    );
                    expect(
                        result.reduce((result, current) => result && current.scale === 2, true)
                    ).toBeTruthy();
                });

                it("without splitting the amounts into smaller units", () => {
                    const money = Money.fromCents(29, USD);
                    const percentages = [13, 87];

                    const result = money.allocate(percentages);

                    expect(result.length).toBe(2);
                    expect(
                        result.find(bucket => bucket.amount === 4 && bucket.scale === 2)
                    ).toBeTruthy();
                    expect(
                        result.find(bucket => bucket.amount === 25 && bucket.scale === 2)
                    ).toBeTruthy();
                });

                it("fractional percentages are best represented by just adding up to 1000 or 10000 etc instead of 100", () => {
                    const money = Money.fromCents(29, USD);
                    const percentages = [1337, 8743];

                    const result = money.allocate(percentages);

                    expect(result.length).toBe(2);
                    expect(
                        result.find(bucket => bucket.amount === 4 && bucket.scale === 2)
                    ).toBeTruthy();
                    expect(
                        result.find(bucket => bucket.amount === 25 && bucket.scale === 2)
                    ).toBeTruthy();
                });
            });
        });

        describe("if given a set of whole part ratios", () => {
            describe("divides money into buckets", () => {
                it("of same scale with expected amounts", () => {
                    const money = Money.fromCents(100, USD);
                    const percentages = [1, 3];

                    const result = money.allocate(percentages);

                    expect(result.length).toBe(2);
                    expect(
                        result.find(bucket => bucket.amount === 25 && bucket.scale === 2)
                    ).toBeTruthy();
                    expect(
                        result.find(bucket => bucket.amount === 75 && bucket.scale === 2)
                    ).toBeTruthy();
                });

                it("so that the sum of all bucket amounts is always equal to the original amount", () => {
                    const money = Money.fromCents(29, USD);
                    const percentages = [11, 45];

                    const result = money.allocate(percentages);

                    expect(result.reduce((sum, current) => sum + current.amount, 0)).toBe(
                        money.amount
                    );
                    expect(
                        result.reduce((result, current) => result && current.scale === 2, true)
                    ).toBeTruthy();
                });

                it("without splitting the amounts into smaller units", () => {
                    const money = Money.fromCents(29, USD);
                    const percentages = [11, 45];

                    const result = money.allocate(percentages);

                    expect(result.length).toBe(2);
                    expect(
                        result.find(bucket => bucket.amount === 6 && bucket.scale === 2)
                    ).toBeTruthy();
                    expect(
                        result.find(bucket => bucket.amount === 23 && bucket.scale === 2)
                    ).toBeTruthy();
                });
            });
        });

        it("returns array containing only unmodified original object if passed no percentages or parts", () => {
            const money = Money.fromCents(29, USD);

            const result = money.allocate([]);

            expect(result.length).toBe(1);
            expect(result[0].amount).toBe(money.amount);
            expect(result[0].currency).toBe(money.currency);
            expect(result[0].scale).toBe(money.scale);
        });
    });

    describe("equals", () => {
        it("returns true if both objects have same amount, currency and scale", () => {
            const amount = 29;
            const currency = USD;
            const scale = 2;
            const first = Money.fromAmount(amount, currency, scale);
            const second = Money.fromAmount(amount, currency, scale);
            expect(first.equals(second)).toBeTruthy();
        });

        it("returns true if both objects have same amount and currency but different scale", () => {
            const amount = 29;
            const currency = USD;
            const first = Money.fromAmount(amount, currency, 2);
            const second = Money.fromAmount(amount * 10, currency, 3);
            expect(first.equals(second)).toBeTruthy();
        });

        it("returns false if objects have same currency but different amounts", () => {
            const currency = USD;
            const first = Money.fromCents(1, currency);
            const second = Money.fromCents(2, currency);
            expect(first.equals(second)).toBeFalsy();
        });

        it("returns false if objects have same amounts but different currency", () => {
            const amount = 29;
            const first = Money.fromCents(amount, USD);
            const second = Money.fromCents(amount, EUR);
            expect(first.equals(second)).toBeFalsy();
        });
    });

    describe("isGreaterThan", () => {
        it("returns true if first object has larger amount than second one", () => {
            const first = Money.fromCents(30, USD);
            const second = Money.fromCents(20, USD);
            expect(first.isGreaterThan(second)).toBeTruthy();
        });

        it("returns false if first object has smaller amount than second one", () => {
            const first = Money.fromCents(20, USD);
            const second = Money.fromCents(30, USD);
            expect(first.isGreaterThan(second)).toBeFalsy();
        });

        it("returns false if both objects have same amounts", () => {
            const first = Money.fromCents(30, USD);
            const second = Money.fromCents(30, USD);
            expect(first.isGreaterThan(second)).toBeFalsy();
        });

        it("throws CurrencyMismatchError if objects have different currencies", () => {
            const first = Money.fromCents(40, USD);
            const second = Money.fromCents(30, EUR);
            expect(() => first.isGreaterThan(second)).toThrow(CurrencyMismatchError);
        });
    });

    describe("isLesserThan", () => {
        it("returns true if first object has smaller amount than second one", () => {
            const first = Money.fromCents(10, USD);
            const second = Money.fromCents(20, USD);
            expect(first.isLesserThan(second)).toBeTruthy();
        });

        it("returns false if first object has larger amount than second one", () => {
            const first = Money.fromCents(40, USD);
            const second = Money.fromCents(30, USD);
            expect(first.isLesserThan(second)).toBeFalsy();
        });

        it("returns false if both objects have same amounts", () => {
            const first = Money.fromCents(30, USD);
            const second = Money.fromCents(30, USD);
            expect(first.isLesserThan(second)).toBeFalsy();
        });

        it("throws CurrencyMismatchError if objects have different currencies", () => {
            const first = Money.fromCents(40, USD);
            const second = Money.fromCents(30, EUR);
            expect(() => first.isLesserThan(second)).toThrow(CurrencyMismatchError);
        });
    });

    describe("isGreaterThanOrEqual", () => {
        it("returns true if first object has larger amount than second one", () => {
            const first = Money.fromCents(30, USD);
            const second = Money.fromCents(20, USD);
            expect(first.isGreaterThanOrEqual(second)).toBeTruthy();
        });

        it("returns false if first object has smaller amount than second one", () => {
            const first = Money.fromCents(20, USD);
            const second = Money.fromCents(30, USD);
            expect(first.isGreaterThanOrEqual(second)).toBeFalsy();
        });

        it("returns true if both objects have same amounts", () => {
            const first = Money.fromCents(30, USD);
            const second = Money.fromCents(30, USD);
            expect(first.isGreaterThanOrEqual(second)).toBeTruthy();
        });

        it("throws CurrencyMismatchError if objects have different currencies", () => {
            const first = Money.fromCents(40, USD);
            const second = Money.fromCents(30, EUR);
            expect(() => first.isGreaterThanOrEqual(second)).toThrow(CurrencyMismatchError);
        });
    });

    describe("isLesserThanOrEqual", () => {
        it("returns true if first object has smaller amount than second one", () => {
            const first = Money.fromCents(10, USD);
            const second = Money.fromCents(20, USD);
            expect(first.isLesserThanOrEqual(second)).toBeTruthy();
        });

        it("returns false if first object has larger amount than second one", () => {
            const first = Money.fromCents(40, USD);
            const second = Money.fromCents(30, USD);
            expect(first.isLesserThanOrEqual(second)).toBeFalsy();
        });

        it("returns true if both objects have same amounts", () => {
            const first = Money.fromCents(30, USD);
            const second = Money.fromCents(30, USD);
            expect(first.isLesserThanOrEqual(second)).toBeTruthy();
        });

        it("throws CurrencyMismatchError if objects have different currencies", () => {
            const first = Money.fromCents(40, USD);
            const second = Money.fromCents(30, EUR);
            expect(() => first.isLesserThanOrEqual(second)).toThrow(CurrencyMismatchError);
        });
    });

    describe("isZero", () => {
        it("returns true if object has amount equal to zero", () => {
            expect(Money.fromCents(0, USD).isZero()).toBeTruthy();
        });

        it("returns false if object has amount not equal to zero", () => {
            expect(Money.fromCents(5, USD).isZero()).toBeFalsy();
        });
    });

    describe("isNotZero", () => {
        it("returns true if object has amount not equal to zero", () => {
            expect(Money.fromCents(5, USD).isNotZero()).toBeTruthy();
        });

        it("returns false if object has amount equal to zero", () => {
            expect(Money.fromCents(0, USD).isNotZero()).toBeFalsy();
        });
    });

    describe("trimScale", () => {
        it("trims scale down to smallest safe scale", () => {
            const money = Money.fromAmount(12345600, USD, 8);

            const result = money.trimScale();

            expect(result.amount).toBe(123456);
            expect(result.scale).toBe(6);
        });

        it("trims scale down to minor unit if safe but no further", () => {
            const money = Money.fromAmount(10000, USD, 4); // 1 USD

            const result = money.trimScale();

            expect(result.amount).toBe(100);
            expect(result.scale).toBe(2);
        });
    });

    describe("roundToCents", () => {
        it("trims scale down to cents if safe to do so", () => {
            const money = Money.fromAmount(123000, USD, 4);

            const result = money.roundToCents();

            expect(result.amount).toBe(1230);
            expect(result.scale).toBe(2);
        });

        it("reduces scale down to cents and rounds cents value up if trimming down to cents isn't safe", () => {
            const money = Money.fromAmount(12344900, USD, 6);

            const result = money.roundToCents();

            expect(result.amount).toBe(1234);
            expect(result.scale).toBe(2);

            const money2 = Money.fromAmount(12345000, USD, 6);

            const result2 = money2.roundToCents();

            expect(result2.amount).toBe(1235);
            expect(result2.scale).toBe(2);
        });

        it("returns amount 0 at scale 2 (cents) if amount is 0 and original scale was greater than 2", () => {
            const money = Money.fromAmount(0, USD, 4);

            const result = money.roundToCents();

            expect(result.amount).toBe(0);
            expect(result.scale).toBe(2);
        });

        it("returns amount 0 at scale 2 (cents) if amount is 0 and original scale was 2", () => {
            const money = Money.fromAmount(0, USD, 2);

            const result = money.roundToCents();

            expect(result.amount).toBe(0);
            expect(result.scale).toBe(2);
        });
    });

    describe("toJSON", () => {
        it("returns money as JSON", () => {
            const money = Money.fromAmount(10, EUR, 1);

            const moneyJson = money.toJSON();

            expect(moneyJson.amount).toBe(10);
            expect(moneyJson.currency.code).toBe("EUR");
            expect(moneyJson.currency.symbol).toBe("€");
            expect(moneyJson.scale).toBe(1);
        });
    });

    describe("fromJSON", () => {
        it("returns money object from JSON", () => {
            const money = Money.fromJSON({
                amount: 100,
                currency: {
                    symbol: "€",
                    code: "EUR",
                },
                scale: 0,
            });

            expect(money).toBeInstanceOf(Money);
            expect(money.amount).toBe(100);
            expect(money.scale).toBe(0);
        });
    });
});
