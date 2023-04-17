import { Currency } from "./Currency";

describe("Currency", () => {
    describe("equals", () => {
        it("returns true if both objects have same code and symbol", () => {
            const first = new Currency({ code: "EUR", symbol: "€" });
            const second = new Currency({ code: "EUR", symbol: "€" });
            expect(first.equals(second)).toBeTruthy();
        });

        it("returns false if objects have same code and diffrent symbol", () => {
            const first = new Currency({ code: "EUR", symbol: "€" });
            const second = new Currency({ code: "EUR", symbol: "$" });
            expect(first.equals(second)).toBeFalsy();
        });

        it("returns false if objects have same symbol and diffrent code", () => {
            const first = new Currency({ code: "EUR", symbol: "€" });
            const second = new Currency({ code: "USD", symbol: "€" });
            expect(first.equals(second)).toBeFalsy();
        });

        it("returns false if objects have different code and diffrent symbol", () => {
            const first = new Currency({ code: "EUR", symbol: "€" });
            const second = new Currency({ code: "USD", symbol: "$" });
            expect(first.equals(second)).toBeFalsy();
        });
    });

    describe("toJSON", () => {
        it("returns currency as JSON", () => {
            const currencyJson = new Currency({ code: "EUR", symbol: "€" }).toJSON();

            expect(currencyJson.code).toBe("EUR");
            expect(currencyJson.symbol).toBe("€");
        });
    });

    describe("fromJSON", () => {
        it("returns currency object from JSON", () => {
            const currency = Currency.fromJSON({
                symbol: "$",
                code: "USD",
            });

            expect(currency).toBeInstanceOf(Currency);
            expect(currency.code).toBe("USD");
            expect(currency.symbol).toBe("$");
        });

        it("throws CurrencyCodeNotSupportedError if currency code is not supported", () => {
            expect(() =>
                Currency.fromJSON({
                    symbol: "$",
                    code: "ABC",
                })
            ).toThrow(`Only supported currency codes allowed, "ABC" passed`);
        });

        it("throws CurrencySymbolNotSupportedError if currency symbol is not supported", () => {
            expect(() =>
                Currency.fromJSON({
                    symbol: "?",
                    code: "USD",
                })
            ).toThrow(`Only supported currency symbols allowed, "?" passed`);
        });
    });
});
