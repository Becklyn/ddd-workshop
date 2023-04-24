import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject, Injectable } from "@nestjs/common";
import { PositiveInteger } from "@becklyn/types";
import { EventStore } from "@becklyn/ddd-nest";
import { ContingentId } from "@EventOrganizing/Domain/Contingent/ContingentId";
import { ContingentRepository } from "@EventOrganizing/Domain/Contingent/ContingentRepository";
import { Command } from "@becklyn/ddd";

export class LimitContingentCommand extends Command {
    public constructor(
        public readonly contingentId: ContingentId,
        public readonly quantity: PositiveInteger
    ) {
        super();
    }
}

@Injectable()
@CommandHandler(LimitContingentCommand)
export class LimitContingentCommandHandler implements ICommandHandler<LimitContingentCommand> {
    public constructor(
        @Inject(EventStore)
        private readonly eventStore: EventStore,
        @Inject(ContingentRepository)
        private readonly contingentRepository: ContingentRepository
    ) {}

    public async execute(command: LimitContingentCommand): Promise<void> {
        const contingent = await this.contingentRepository.findOneById(command.contingentId);

        contingent.limit(command.quantity);

        await this.eventStore.append(contingent.dequeueEvents());
    }
}
