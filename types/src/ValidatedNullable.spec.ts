import { ValidatedNullableBuilder } from "./ValidatedNullable";

describe("ValidatedNullableBuilder", () => {
    describe("valid", () => {
        it("returns a valid ValidatedNullable", () => {
            const value = "foo";
            const validatedNullable = ValidatedNullableBuilder.valid(value);
            expect(validatedNullable.value).toBe(value);
            expect(validatedNullable.isValid).toBe(true);
            expect(validatedNullable.validationError).toBe(null);
        });
    });

    describe("invalid", () => {
        it("returns an invalid ValidatedNullable", () => {
            const value = "foo";
            const validationError = "bar";
            const validatedNullable = ValidatedNullableBuilder.invalid(value, validationError);
            expect(validatedNullable.value).toBe(value);
            expect(validatedNullable.isValid).toBe(false);
            expect(validatedNullable.validationError).toBe(validationError);
        });
    });
});
