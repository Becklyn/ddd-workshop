import { Command } from "../Domain/Command";
import { CommandStore } from "./CommandStore";

export abstract class CommandBus {
    protected commandStore: CommandStore | null;

    public setCommandStore(commandStore: CommandStore): void {
        this.commandStore = commandStore;
    }

    public async dispatch(command: Command): Promise<void> {
        await this.commandStore?.append(command);
        await this.dispatchCommandToInfrastructure(command);
    }

    protected abstract dispatchCommandToInfrastructure(command: Command): Promise<void>;
}
