import { assertOptionalValue, OptionalValue } from "./BaseTypes";

export class Optional<T> {
    private constructor(public readonly value: OptionalValue<T>) {}

    static fromValue = <T>(value: OptionalValue<T> | undefined): Optional<T> => {
        // this check is required as a guard so TS knows the Optional may never contain undefined
        const optionalValue = value === null || value === undefined ? null : value;
        return new Optional(optionalValue);
    };

    static null = (): Optional<any> => new Optional(null);

    public valueOrDefault = (defaultValue: T): T => {
        return this.value ?? defaultValue;
    };

    public isNull = (): boolean => this.value === null;

    public isNotNull = (): boolean => this.value !== null;

    public map = <Output>(mapFunction: (value: T) => Output): Optional<Output> =>
        new Optional(this.value ? mapFunction(this.value) : null);

    public call = (callback: (value: T) => void): Optional<T> => {
        if (this.value !== null) {
            callback(this.value);
        }

        return this;
    };

    public callAsync = async (callback: (value: T) => Promise<void>): Promise<Optional<T>> => {
        if (this.value !== null) {
            await callback(this.value);
        }

        return this;
    };

    public callIfNull = (callback: () => void): Optional<T> => {
        if (this.value === null) {
            callback();
        }

        return this;
    };

    public callIfNullAsync = async (callback: () => Promise<void>): Promise<Optional<T>> => {
        if (this.value === null) {
            await callback();
        }

        return this;
    };

    public throwIfNull = <ErrorType extends Error>(error: ErrorType): Optional<T> => {
        if (this.value === null) {
            throw error;
        }

        return this;
    };

    public callEither = (
        nullCallback: () => void,
        notNullCallback: (value: T) => void
    ): Optional<T> => {
        if (this.value !== null) {
            notNullCallback(this.value);
        } else {
            nullCallback();
        }

        return this;
    };

    public callEitherAsync = async (
        nullCallback: () => Promise<void>,
        notNullCallback: (value: T) => Promise<void>
    ): Promise<Optional<T>> => {
        if (this.value !== null) {
            await notNullCallback(this.value);
        } else {
            await nullCallback();
        }

        return this;
    };

    public fold = <Output>(
        nullMapFunction: () => Output,
        notNullMapFunction: (value: T) => Output
    ): Output => {
        if (this.value !== null) {
            return notNullMapFunction(this.value);
        }

        return nullMapFunction();
    };

    public unfold = <NullOutput, NotNullOutput>(
        nullMapFunction: () => NullOutput,
        notNullMapFunction: (value: T) => NotNullOutput
    ): NullOutput | NotNullOutput => {
        if (this.value !== null) {
            return notNullMapFunction(this.value);
        }

        return nullMapFunction();
    };

    public assertValue(
        assertionThrowingError: (value: T, propertyName?: string) => void,
        propertyName?: string
    ): void {
        assertOptionalValue(assertionThrowingError, this.value, propertyName);
    }
}
