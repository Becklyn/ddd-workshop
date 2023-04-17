import { v4 as uuidV4 } from "uuid";
import { CommandId } from "../../Commands";
import { MessageId } from "./MessageId";
import { EventId } from "../../Events";

describe("MessageId", () => {
    describe("equals", () => {
        it("returns true for two MessageIds with same value ", () => {
            const value = uuidV4();
            const id1 = MessageId.fromString(MessageId, value);
            const id2 = MessageId.fromString(MessageId, value);
            expect(id1.equals(id2)).toBeTruthy();
        });

        it("returns false for two MessageIds with different values", () => {
            const value1 = uuidV4();
            const value2 = uuidV4();
            expect(value1).not.toBe(value2);
            const id1 = MessageId.fromString(MessageId, value1);
            const id2 = MessageId.fromString(MessageId, value2);
            expect(id1.equals(id2)).toBeFalsy();
        });

        it("returns true for a CommandId and MessageId with same value ", () => {
            const value = uuidV4();
            const id1 = MessageId.fromString(MessageId, value);
            const id2 = CommandId.fromString(CommandId, value);
            expect(id1.equals(id2)).toBeTruthy();
        });

        it("returns true for an EventId and MessageId with same value ", () => {
            const value = uuidV4();
            const id1 = MessageId.fromString(MessageId, value);
            const id2 = EventId.fromString(EventId, value);
            expect(id1.equals(id2)).toBeTruthy();
        });
    });
});
