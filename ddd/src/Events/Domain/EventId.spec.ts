import { v4 as uuidV4, validate } from "uuid";
import { EventId } from "./EventId";
import { MessageId } from "../../Messages";

describe("EventId", () => {
    describe("next", () => {
        it("returns instance of EventId", () => {
            expect(EventId.next(EventId)).toBeInstanceOf(EventId);
        });
    });

    describe("fromString", () => {
        it("returns instance of EventId", () => {
            expect(EventId.fromString(EventId, uuidV4())).toBeInstanceOf(EventId);
        });

        it("throws error when something other than uuid is passed", () => {
            const value = "foo";
            expect(validate(value)).toBeFalsy();
            expect(() => EventId.fromString(EventId, value)).toThrow();
        });
    });

    describe("asString", () => {
        it("returns value passed to fromString", () => {
            const value = uuidV4();
            expect(EventId.fromString(EventId, value).asString()).toBe(value);
        });
    });

    describe("equals", () => {
        it("returns true for two EventIds of same value", () => {
            const value = uuidV4();
            const id1 = EventId.fromString(EventId, value);
            const id2 = EventId.fromString(EventId, value);
            expect(id1.equals(id2)).toBeTruthy();
        });

        it("returns false for two EventIds of different values", () => {
            const value1 = uuidV4();
            const value2 = uuidV4();
            expect(value1).not.toBe(value2);
            const id1 = EventId.fromString(EventId, value1);
            const id2 = EventId.fromString(EventId, value2);
            expect(id1.equals(id2)).toBeFalsy();
        });

        it("returns true for an EventId and MessageId with same value ", () => {
            const value = uuidV4();
            const id1 = EventId.fromString(EventId, value);
            const id2 = MessageId.fromString(MessageId, value);
            expect(id1.equals(id2)).toBeTruthy();
        });

        it("returns false for an EventId and MessageId with different values", () => {
            const value1 = uuidV4();
            const value2 = uuidV4();
            expect(value1).not.toBe(value2);
            const id1 = EventId.fromString(EventId, value1);
            const id2 = MessageId.fromString(MessageId, value2);
            expect(id1.equals(id2)).toBeFalsy();
        });
    });
});
