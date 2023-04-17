import { Command } from "./Command";

class TestCommand extends Command {
    public constructor() {
        super();
    }
}

describe("Command", () => {
    describe("that has not been correlated", () => {
        it("has its own id as correlation id", () => {
            const command = new TestCommand();
            expect(command.id.equals(command.correlationId)).toBeTruthy();
        });

        it("has its own id as causation id", () => {
            const command = new TestCommand();
            expect(command.id.equals(command.causationId)).toBeTruthy();
        });
    });

    describe("that has been correlated with another message", () => {
        let otherMessage: TestCommand;

        beforeEach(() => {
            const firstMessage = new TestCommand();
            const secondMessage = new TestCommand();
            secondMessage.correlateWith(firstMessage);

            expect(secondMessage.id.equals(secondMessage.correlationId)).toBeFalsy();

            otherMessage = secondMessage;
        });

        it("has the correlation id of that message as its correlation id", () => {
            const command = new TestCommand();
            command.correlateWith(otherMessage);

            expect(command.correlationId.equals(otherMessage.correlationId)).toBeTruthy();
            expect(command.correlationId.equals(command.id)).toBeFalsy();
        });

        it("has the id of that message as its causation id", () => {
            const command = new TestCommand();
            command.correlateWith(otherMessage);

            expect(command.causationId.equals(otherMessage.id)).toBeTruthy();
            expect(command.causationId.equals(command.id)).toBeFalsy();
        });
    });
});
