export type ValidatedNullable<T> = {
    value: T | null;
    isValid: boolean;
    validationError: string | null;
};

export class ValidatedNullableBuilder {
    public static valid = <T>(value: T): ValidatedNullable<T> => {
        return {
            value,
            isValid: true,
            validationError: null,
        };
    };

    public static invalid = <T>(value: T, validationError: string): ValidatedNullable<T> => {
        return {
            value,
            isValid: false,
            validationError,
        };
    };
}
