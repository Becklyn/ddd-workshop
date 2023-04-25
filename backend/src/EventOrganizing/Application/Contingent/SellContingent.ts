import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject, Injectable } from "@nestjs/common";
import { PositiveInteger } from "@becklyn/types";
import { EventStore } from "@becklyn/ddd-nest";
import { ContingentId } from "@EventOrganizing/Domain/Contingent/ContingentId";
import { ContingentRepository } from "@EventOrganizing/Domain/Contingent/ContingentRepository";
import { Command } from "@becklyn/ddd";

export class SellContingentCommand extends Command {
    public constructor(
        public readonly contingentId: ContingentId,
        public readonly quantity: PositiveInteger
    ) {
        super();
    }
}

@Injectable()
@CommandHandler(SellContingentCommand)
export class SellContingentCommandHandler implements ICommandHandler<SellContingentCommand> {
    public constructor(
        @Inject(EventStore)
        private readonly eventStore: EventStore,
        @Inject(ContingentRepository)
        private readonly contingentRepository: ContingentRepository
    ) {}

    public async execute(command: SellContingentCommand): Promise<void> {
        const contingent = await this.contingentRepository.findOneById(command.contingentId);

        contingent.sell(command.quantity);

        await this.eventStore.append(contingent.dequeueEvents());
    }
}
