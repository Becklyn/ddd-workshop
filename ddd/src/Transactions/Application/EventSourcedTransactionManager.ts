import { TransactionManager } from "./TransactionManager";
import { EventRegistry, EventStore } from "../../Events";

export class EventSourcedTransactionManager implements TransactionManager {
    public constructor(
        private readonly eventRegistry: EventRegistry,
        private readonly eventStore: EventStore
    ) {}

    async begin(): Promise<void> {
        // effectively deletes events
        this.eventRegistry.dequeueEvents();
    }

    async commit(): Promise<void> {
        await this.eventStore.append(this.eventRegistry.dequeueEvents());
    }

    async rollback(): Promise<void> {
        // effectively deletes events
        this.eventRegistry.dequeueEvents();
    }
}
