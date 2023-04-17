import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject, Injectable } from "@nestjs/common";
import { PositiveInteger } from "@becklyn/types";
import { EventStore } from "@becklyn/ddd-nest";
import { ContingentId } from "@EventOrganizing/Domain/Contingent/ContingentId";
import { ContingentRepository } from "@EventOrganizing/Domain/Contingent/ContingentRepository";

export class IncreaseContingentCommand {
    public constructor(
        public readonly contingentId: ContingentId,
        public readonly quantity: PositiveInteger
    ) {}
}

@Injectable()
@CommandHandler(IncreaseContingentCommand)
export class IncreaseContingentCommandHandler
    implements ICommandHandler<IncreaseContingentCommand>
{
    public constructor(
        @Inject(EventStore)
        private readonly eventStore: EventStore,
        @Inject(ContingentRepository)
        private readonly contingentRepository: ContingentRepository
    ) {}

    public async execute(command: IncreaseContingentCommand): Promise<void> {
        const contingent = await this.contingentRepository.findOneById(command.contingentId);

        contingent.increase(command.quantity);

        await this.eventStore.append(contingent.dequeueEvents());
    }
}
