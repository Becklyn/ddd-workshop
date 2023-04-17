import { reset } from "ts-mockito";
import { resetTest, when, then, createMockAndInstance } from "@becklyn/gherkin-style-tests";
import { CommandBus } from "@nestjs/cqrs";
import { NestCommandBus } from "./NestCommandBus";
import { Command, CommandStore } from "@becklyn/ddd";

class TestCommand extends Command {
    public constructor() {
        super();
    }
}

describe("NestCommandBus", () => {
    const [nestBusMock, nestBus] = createMockAndInstance(CommandBus);
    const [commandStoreMock, commandStore] = createMockAndInstance<CommandStore>();

    const fixture = new NestCommandBus(nestBus);

    beforeEach(() => {
        reset(nestBusMock);
        reset(commandStoreMock);
        resetTest();
    });

    describe("dispatch", () => {
        it("passes the command to the @nestjs/cqrs CommandBus", async () => {
            const command = new TestCommand();

            when(await fixture.dispatch(command));

            then(nestBusMock.execute(command)).shouldHaveBeenCalledOnce();
        });

        it("passes the command to command store before passing it to the @nestjs/cqrs CommandBus", async () => {
            fixture.setCommandStore(commandStore);

            const command = new TestCommand();
            when(await fixture.dispatch(command));

            then(commandStoreMock.append(command)).shouldHaveBeenCalledBefore(
                nestBusMock.execute(command)
            );
        });
    });
});
