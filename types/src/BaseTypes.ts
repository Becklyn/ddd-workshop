export type NonEmptyString = string;

export const assertNonEmptyString = (string: string, propertyName?: string): void => {
    if (string === "") {
        const errorMessage = propertyName
            ? `${propertyName} must not be empty, empty string passed`
            : `Empty string passed`;
        throw new TypeError(errorMessage);
    }
};

export type UuidString = string;

export type Integer = number;

export const assertInteger = (number: Integer, propertyName?: string): void => {
    if (!Number.isInteger(number)) {
        const errorMessage = propertyName
            ? `${propertyName} must be an integer, "${number}" passed`
            : `${number} is not an integer`;
        throw new TypeError(errorMessage);
    }
};

export type PositiveInteger = Integer;

export const assertPositiveInteger = (number: PositiveInteger, propertyName?: string): void => {
    if (!Number.isInteger(number) || number <= 0) {
        const errorMessage = propertyName
            ? `${propertyName} must be a positive integer, "${number}" passed`
            : `${number} is not a positive integer`;
        throw new TypeError(errorMessage);
    }
};

export type PositiveIntegerOrZero = Integer;

export const assertPositiveIntegerOrZero = (
    number: PositiveIntegerOrZero,
    propertyName?: string
): void => {
    if (!Number.isInteger(number) || number < 0) {
        const errorMessage = propertyName
            ? `${propertyName} must be a positive integer or zero, "${number}" passed`
            : `${number} is not a positive integer or zero`;
        throw new TypeError(errorMessage);
    }
};

export type MillisecondsSinceEpoch = PositiveIntegerOrZero;

export type OptionalValue<T> = T | null;

export const assertOptionalValue = <T>(
    assertionThrowingError: (value: T, propertyName?: string) => void,
    value: OptionalValue<T>,
    propertyName?: string
): void => {
    if (value === null) {
        return;
    }

    assertionThrowingError(value, propertyName);
};

export type DeepReadonly<TInput> = {
    readonly [TKey in keyof TInput]: TInput[TKey] extends object
        ? DeepReadonly<TInput[TKey]>
        : TInput[TKey];
};

export type NonEmptyArray<T> = [T, ...T[]];

export type OneOrMore<T> = T | NonEmptyArray<T>;

type Only<T, U> = {
    [P in keyof T]: T[P];
} & {
    [P in keyof U]?: never;
};

export type EitherValue<T, U> = Only<T, U> | Only<U, T>;
