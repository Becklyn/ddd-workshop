import { Currency, EUR } from "./Currency";
import { Money } from "./Money";

export const givenMoneyFromCents = (cents: number, currency: Currency): Money =>
    Money.fromCents(cents, currency);

export const givenEuroCents = (cents: number): Money => givenMoneyFromCents(cents, EUR);
