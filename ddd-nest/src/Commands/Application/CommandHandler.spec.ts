import { reset } from "ts-mockito";
import { resetTest, when, then, given, createMockAndInstance } from "@becklyn/gherkin-style-tests";
import { CommandHandler } from "./CommandHandler";
import { Command, EventProvider, EventRegistry, TransactionManager } from "@becklyn/ddd";

class Provider implements EventProvider<any> {
    dequeueEvents(): any[] {
        return [];
    }

    doSomething(): any {
        return 1;
    }

    public doSomethingInPostRollback(): void {
        1 + 2; // necessary for eslint not to complain
    }
}

class TestCommand extends Command {
    constructor(public readonly provider: Provider) {
        super();
    }
}

class Fixture extends CommandHandler<TestCommand> {
    protected async handleCommandLogic(command: TestCommand): Promise<EventProvider<any> | null> {
        const provider = command.provider;
        provider.doSomething();
        return provider;
    }
}

describe("CommandHandler", () => {
    const [transactionManagerMock, transactionManager] =
        createMockAndInstance<TransactionManager>();
    const [eventRegistryMock, eventRegistry] = createMockAndInstance(EventRegistry);
    const [providerMock, provider] = createMockAndInstance(Provider);

    const fixture = new Fixture();

    beforeEach(() => {
        reset(eventRegistryMock);
        reset(transactionManagerMock);
        reset(providerMock);
        resetTest();

        fixture.setEventRegistry(eventRegistry);
        fixture.setTransactionManager(transactionManager);
    });

    describe("execute", () => {
        it("begins transaction, handles command, dequeues event provider and commits transaction, in that order", async () => {
            given(providerMock.dequeueEvents()).returns([]);

            when(await fixture.execute(new TestCommand(provider)));

            then(transactionManagerMock.begin())
                .shouldHaveBeenCalledBefore(providerMock.doSomething())
                .and(providerMock.doSomething())
                .shouldHaveBeenCalledBefore(providerMock.dequeueEvents())
                .and(providerMock.dequeueEvents())
                .shouldHaveBeenCalledBefore(transactionManagerMock.commit());
        });
    });
});
