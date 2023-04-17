import { v4 as uuidV4 } from "uuid";
import { MessageId } from "../../Identity";
import { CommandId } from "./CommandId";

describe("CommandId", () => {
    describe("equals", () => {
        it("returns true for two CommandIds with same value ", () => {
            const value = uuidV4();
            const id1 = CommandId.fromString(CommandId, value);
            const id2 = CommandId.fromString(CommandId, value);
            expect(id1.equals(id2)).toBeTruthy();
        });

        it("returns false for two CommandIds with different values", () => {
            const value1 = uuidV4();
            const value2 = uuidV4();
            expect(value1).not.toBe(value2);
            const id1 = CommandId.fromString(CommandId, value1);
            const id2 = CommandId.fromString(CommandId, value2);
            expect(id1.equals(id2)).toBeFalsy();
        });

        it("returns true for a CommandId and MessageId with same value ", () => {
            const value = uuidV4();
            const id1 = CommandId.fromString(CommandId, value);
            const id2 = MessageId.fromString(MessageId, value);
            expect(id1.equals(id2)).toBeTruthy();
        });

        it("returns false for a CommandId and MessageId with different values", () => {
            const value1 = uuidV4();
            const value2 = uuidV4();
            expect(value1).not.toBe(value2);
            const id1 = CommandId.fromString(CommandId, value1);
            const id2 = MessageId.fromString(MessageId, value2);
            expect(id1.equals(id2)).toBeFalsy();
        });
    });
});
