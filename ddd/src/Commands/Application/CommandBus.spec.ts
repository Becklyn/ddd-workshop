import { CommandStore } from "./CommandStore";
import { CommandBus } from "./CommandBus";
import { Command } from "../Domain/Command";
import { createMockAndInstance, resetTest, then, when } from "@becklyn/gherkin-style-tests";
import { reset } from "ts-mockito";

class TestCommandBus extends CommandBus {
    public constructor(private readonly infrastructure: Infrastructure) {
        super();
    }

    protected async dispatchCommandToInfrastructure(command: Command): Promise<void> {
        await this.infrastructure.dispatchCommand(command);
    }
}

interface Infrastructure {
    dispatchCommand(command: Command): Promise<void>;
}

class TestCommand extends Command {
    public constructor() {
        super();
    }
}

describe("CommandBus", () => {
    const [commandStoreMock, commandStore] = createMockAndInstance<CommandStore>();
    const [infrastructureMock, infrastructure] = createMockAndInstance<Infrastructure>();

    beforeEach(() => {
        reset(commandStoreMock);
        reset(infrastructureMock);
        resetTest();
    });

    it("appends commands to the command before dispatching them to infrastructure", async () => {
        const commandBus = new TestCommandBus(infrastructure);
        commandBus.setCommandStore(commandStore);

        const command = new TestCommand();

        when(await commandBus.dispatch(command));
        then(commandStoreMock.append(command)).shouldHaveBeenCalledBefore(
            infrastructureMock.dispatchCommand(command)
        );
    });

    it("dispatches command to infrastructure if command store is not set", async () => {
        const commandBus = new TestCommandBus(infrastructure);

        const command = new TestCommand();

        when(await commandBus.dispatch(command));
        then(infrastructureMock.dispatchCommand(command)).shouldHaveBeenCalledOnce();
    });
});
