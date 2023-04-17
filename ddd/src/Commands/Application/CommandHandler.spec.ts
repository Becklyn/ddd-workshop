import { anything, reset } from "ts-mockito";
import { resetTest, given, when, then, createMockAndInstance } from "@becklyn/gherkin-style-tests";
import { CommandHandler } from "./CommandHandler";
import { DomainEvent, EventProvider, EventRegistry } from "../../Events";
import { TransactionManager } from "../../Transactions";
import { Command } from "../Domain/Command";
import { AggregateId } from "../../Identity";

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

class TestAggregateId extends AggregateId {}
class TestEvent extends DomainEvent<any> {
    get aggregateId(): any {
        return TestAggregateId.next(TestAggregateId);
    }
}

class TestCommand extends Command {
    constructor(public readonly provider: Provider) {
        super();
    }
}

class Fixture extends CommandHandler<TestCommand> {
    public async execute(command: TestCommand): Promise<void> {
        await this.handleCommand(command);
    }

    protected async handleCommandLogic(command: TestCommand): Promise<EventProvider<any> | null> {
        const provider = command.provider;
        provider.doSomething();
        return provider;
    }

    protected async postRollback(e: any, command: TestCommand): Promise<any> {
        command.provider.doSomethingInPostRollback();
        return e;
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

    it("begins transaction, rolls back transaction and re-throws error, in that order, if command handling throws error", async () => {
        given(providerMock.doSomething()).throws(new Error("foo"));

        await when(
            async () => await fixture.execute(new TestCommand(provider))
        ).thenErrorShouldHaveBeenThrownAsync("foo");

        then(transactionManagerMock.begin()).shouldHaveBeenCalledBefore(
            transactionManagerMock.rollback()
        );
    });

    it("executes postRollback after transaction rollback if command handling throws error", async () => {
        given(providerMock.doSomething()).throws(new Error());

        await when(async () =>
            fixture.execute(new TestCommand(provider))
        ).thenErrorShouldHaveBeenThrownAsync();

        then(transactionManagerMock.rollback()).shouldHaveBeenCalledBefore(
            providerMock.doSomethingInPostRollback()
        );
    });

    it("correlates all events with the command and passes them to the event registry after correlating them", async () => {
        const [commandMock, command] = createMockAndInstance(TestCommand);
        const [eventMock, event] = createMockAndInstance(TestEvent);

        given(commandMock.provider).returns(provider);
        given(providerMock.dequeueEvents()).returns([event]);

        when(await fixture.execute(command));

        then(eventMock.correlateWith(command)).shouldHaveBeenCalledBefore(
            eventRegistryMock.dequeueProviderAndRegisterEvents(anything())
        );
    });
});
