import { Currency as OurCurrency } from "./Currency";
import * as dineroCurrencies from "@dinero.js/currencies";
import { Currency } from "@dinero.js/currencies";
import { Either } from "@becklyn/types";
import { dinero, Dinero } from "dinero.js";
import { Money } from "./Money";

const isDineroCurrency = (object: any): object is Currency<number> => {
    return (
        "code" in object &&
        "base" in object &&
        "exponent" in object &&
        typeof object.base === "number"
    );
};

export const toDineroCurrency = (
    currency: OurCurrency
): Either<DineroCurrencyNotFoundError, Currency<number>> => {
    const dineroCurrency = Object.values(dineroCurrencies)
        .filter(dineroCurrency => isDineroCurrency(dineroCurrency))
        .find(dineroCurrency => dineroCurrency.code === currency.code);

    return dineroCurrency === undefined
        ? Either.left(
              new DineroCurrencyNotFoundError(
                  `Corresponding dinero.js currency could not be found for code '${currency.code}'`
              )
          )
        : Either.right(dineroCurrency);
};

export class DineroCurrencyNotFoundError extends Error {}

export const moneyAsDinero = (money: Money): Dinero<number> =>
    dinero({
        amount: money.amount,
        currency: toDineroCurrency(money.currency).throwLeft().right(),
        scale: money.scale,
    });
