import {
    assertInteger,
    assertNonEmptyString,
    assertOptionalValue,
    assertPositiveInteger,
    assertPositiveIntegerOrZero,
} from "./BaseTypes";
import { when } from "@becklyn/gherkin-style-tests/dist";

describe("assertNonEmptyString", () => {
    it("throws TypeError if string is empty", () => {
        expect(() => assertNonEmptyString("")).toThrow(TypeError);
    });

    it("does not throw any error if string is not empty", () => {
        expect(() => assertNonEmptyString("asdasd")).not.toThrow();
    });
});

describe("assertInteger", () => {
    it("throws TypeError if number is not an integer", () => {
        [-0.1, 0.1].forEach(number => expect(() => assertInteger(number)).toThrow(TypeError));
    });

    it("does not throw any error if number is an integer", () => {
        [-1, 0, 1].forEach(number => expect(() => assertInteger(number)).not.toThrow(TypeError));
    });

    it("throws TypeError with a specified property name", () => {
        expect(() => assertInteger(0.1, "Quantity")).toThrow(
            `Quantity must be an integer, "0.1" passed`
        );
    });
});

describe("assertPositiveInteger", () => {
    it("throws TypeError if number is not an integer", () => {
        [-0.1, 0.1].forEach(number =>
            expect(() => assertPositiveInteger(number)).toThrow(TypeError)
        );
    });

    it("throws TypeError if number is a negative integer", () => {
        expect(() => assertPositiveInteger(-1)).toThrow(TypeError);
    });

    it("throws TypeError if number is zero", () => {
        expect(() => assertPositiveInteger(0)).toThrow(TypeError);
    });

    it("does not throw any error if number is a positive integer", () => {
        expect(() => assertPositiveInteger(1)).not.toThrow(TypeError);
    });

    it("throws TypeError with a specified property name", () => {
        expect(() => assertPositiveInteger(-1, "Number")).toThrow(
            `Number must be a positive integer, "-1" passed`
        );
    });
});

describe("assertPositiveIntegerOrZero", () => {
    it("throws TypeError if number is not an integer", () => {
        [-0.1, 0.1].forEach(number =>
            expect(() => assertPositiveIntegerOrZero(number)).toThrow(TypeError)
        );
    });

    it("throws TypeError if number is a negative integer", () => {
        expect(() => assertPositiveIntegerOrZero(-1)).toThrow(TypeError);
    });

    it("does not throw any error if number is zero", () => {
        expect(() => assertPositiveIntegerOrZero(0)).not.toThrow(TypeError);
    });

    it("does not throw any error if number is a positive integer", () => {
        expect(() => assertPositiveIntegerOrZero(1)).not.toThrow(TypeError);
    });

    it("throws TypeError with a specified property name", () => {
        expect(() => assertPositiveIntegerOrZero(-1, "Count")).toThrow(
            `Count must be a positive integer or zero, "-1" passed`
        );
    });
});

describe("assertOptionalValue", () => {
    const assertTrue = (value: boolean): void => {
        if (!value) {
            throw new Error("foo");
        }
    };

    const failingValue = false;
    const passingValue = true;

    it("throws error if value fails the assertions", () => {
        when(() => assertTrue(failingValue)).thenErrorShouldHaveBeenThrown();
        when(() => assertOptionalValue(assertTrue, failingValue)).thenErrorShouldHaveBeenThrown();
    });

    it("does not throw error if value passes the assertions", () => {
        when(() => assertTrue(passingValue)).thenErrorShouldNotHaveBeenThrown();
        when(() =>
            assertOptionalValue(assertTrue, passingValue)
        ).thenErrorShouldNotHaveBeenThrown();
    });

    it("does not throw error if value is null", () => {
        when(() => assertOptionalValue(assertTrue, null)).thenErrorShouldNotHaveBeenThrown();
    });
});
