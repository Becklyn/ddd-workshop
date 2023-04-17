import { Command, CommandHandler as Base } from "@becklyn/ddd";
import { Inject, Injectable } from "@nestjs/common";
import { TransactionManager } from "../../Transactions";
import { EventRegistry } from "../../Events";
import { ICommandHandler } from "@nestjs/cqrs";

@Injectable()
export abstract class CommandHandler<CommandType extends Command>
    extends Base<CommandType>
    implements ICommandHandler<CommandType>
{
    @Inject(TransactionManager)
    protected transactionManager: TransactionManager;

    @Inject(EventRegistry)
    protected eventRegistry: EventRegistry;

    public async execute(command: CommandType): Promise<void> {
        await this.handleCommand(command);
    }
}
