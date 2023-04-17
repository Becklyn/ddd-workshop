import { TransactionManager } from "../../Transactions";
import { DomainEvent, EventProvider, EventRegistry } from "../../Events";
import { Message } from "../../Messages/Domain/Message";
import { Command } from "../Domain/Command";

export abstract class CommandHandler<CommandType extends Command> {
    // We are not defining a constructor for dependencies. We are defining setter methods instead, so that any kind of
    // dependency injection can be used; frameworks which require constructor injection can create one in their
    // framework-specific classes which extend this one

    protected transactionManager: TransactionManager;
    protected eventRegistry: EventRegistry;

    public setTransactionManager(transactionManager: TransactionManager): void {
        this.transactionManager = transactionManager;
    }

    public setEventRegistry(eventRegistry: EventRegistry): void {
        this.eventRegistry = eventRegistry;
    }

    /**
     * Needs to be called by an async public method on the concrete handler which is type hinted to the concrete command class
     */
    protected async handleCommand(command: CommandType): Promise<void> {
        await this.transactionManager.begin();

        try {
            const eventProvider = await this.handleCommandLogic(command);
            if (eventProvider) {
                this.eventRegistry.dequeueProviderAndRegisterEvents(
                    new EventCorrelator(eventProvider, command)
                );
            }
            await this.transactionManager.commit();
        } catch (e) {
            await this.transactionManager.rollback();
            e = await this.postRollback(e, command);
            throw e;
        }
    }

    /**
     * Needs to be implemented by the concrete handler, performing any and all command handling logic
     */
    protected abstract handleCommandLogic(command: CommandType): Promise<EventProvider<any> | null>;

    /**
     * May be overridden by the concrete handler if special processing of exceptions thrown by the try method is required. Must either throw or return any
     * exceptions.
     */
    // @ts-ignore
    protected async postRollback(e: any, command: CommandType): Promise<any> {
        return e;
    }
}

class EventCorrelator implements EventProvider<any> {
    private events: DomainEvent<any>[];

    public constructor(provider: EventProvider<any>, correlateWith: Message) {
        this.events = provider.dequeueEvents();
        this.events.forEach((event: DomainEvent<any>) => event.correlateWith(correlateWith));
    }

    dequeueEvents(): any[] {
        const events = this.events;
        this.events = [];
        return events;
    }
}
