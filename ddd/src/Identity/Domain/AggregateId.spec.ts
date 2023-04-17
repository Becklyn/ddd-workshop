import { AggregateId } from "./AggregateId";
import { v4 as uuidV4, validate } from "uuid";
import { then, when } from "@becklyn/gherkin-style-tests";

class TestId extends AggregateId {}
class TestId2 extends AggregateId {}

/**
 * Tests are written only for AggregateId because it is the last class in the
 * Id - EntityId - AggregateId inheritance chain and testing it is the only way
 * of getting full code coverage for all of them without duplicating testing
 * code between them.
 */

describe("AggregateId", () => {
    describe("next", () => {
        it("returns instance of specified concrete Id", () => {
            expect(AggregateId.next(TestId)).toBeInstanceOf(TestId);
        });
    });

    describe("fromString", () => {
        it("returns instance of specified concrete Id", () => {
            expect(AggregateId.fromString(TestId, uuidV4())).toBeInstanceOf(TestId);
        });

        it("throws error when something other than uuid is passed", () => {
            const value = "foo";
            expect(validate(value)).toBeFalsy();
            expect(() => AggregateId.fromString(TestId, value)).toThrow();
        });
    });

    describe("asString", () => {
        it("returns value passed to fromString", () => {
            const value = uuidV4();
            expect(AggregateId.fromString(TestId, value).asString()).toBe(value);
        });
    });

    describe("equals", () => {
        it("returns true for two Ids of same concrete class and value", () => {
            const value = uuidV4();
            const type = TestId;
            const id1 = AggregateId.fromString(type, value);
            const id2 = AggregateId.fromString(type, value);
            expect(id1.equals(id2)).toBeTruthy();
        });

        it("returns false for two Ids of same concrete class but different values", () => {
            const type = TestId;
            const value1 = uuidV4();
            const value2 = uuidV4();
            expect(value1).not.toBe(value2);
            const id1 = AggregateId.fromString(type, value1);
            const id2 = AggregateId.fromString(type, value2);
            expect(id1.equals(id2)).toBeFalsy();
        });

        it("returns false for two Ids of same value but different concrete classes", () => {
            const value = uuidV4();
            const type1 = TestId;
            const type2 = TestId2;
            expect(type1).not.toBe(type2);
            const id1 = AggregateId.fromString(type1, value);
            const id2 = AggregateId.fromString(type2, value);
            expect(id1.equals(id2)).toBeFalsy();
        });
    });

    describe("aggregateType", () => {
        it("returns name of corresponding aggregate which is the same as its class name without 'Id' at the end", () => {
            const aggregateId = TestId.next(TestId);
            when(aggregateId.aggregateType);
            then("Test").shouldHaveBeenReturned();
        });
    });
});
