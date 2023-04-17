const currencyCodes = ["USD", "EUR"] as const;
export type CurrencyCode = typeof currencyCodes[number];

const currencySymbols = ["$", "€"] as const;
export type CurrencySymbol = typeof currencySymbols[number];

export type CurrencyValue = {
    code: CurrencyCode;
    symbol: CurrencySymbol;
};

export class Currency implements CurrencyValue {
    public readonly code: CurrencyCode;
    public readonly symbol: CurrencySymbol;

    public constructor(value: CurrencyValue) {
        this.code = value.code;
        this.symbol = value.symbol;
    }

    public equals = (other: Currency): boolean =>
        this.code === other.code && this.symbol === other.symbol;

    public toJSON = (): CurrencyJson => ({ code: this.code, symbol: this.symbol });

    public static fromJSON = (currencyJson: CurrencyJson): Currency => {
        const { code, symbol } = currencyJson;

        if ((currencyCodes as readonly string[]).includes(code) === false)
            throw new CurrencyCodeNotSupportedError(code);
        if ((currencySymbols as readonly string[]).includes(symbol) === false)
            throw new CurrencySymbolNotSupportedError(symbol);

        return new Currency({ code, symbol } as CurrencyValue);
    };
}

export type CurrencyJson = {
    code: string;
    symbol: string;
};

export const EUR: Currency = new Currency({
    code: "EUR",
    symbol: "€",
});

export const USD: Currency = new Currency({
    code: "USD",
    symbol: "$",
});

export class CurrencyCodeNotSupportedError extends TypeError {
    constructor(code: string) {
        super(`Only supported currency codes allowed, "${code}" passed`);
    }
}
export class CurrencySymbolNotSupportedError extends TypeError {
    constructor(symbol: string) {
        super(`Only supported currency symbols allowed, "${symbol}" passed`);
    }
}
