import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject, Injectable } from "@nestjs/common";
import { EventStore } from "@becklyn/ddd-nest";
import { ContingentId } from "@EventOrganizing/Domain/Contingent/ContingentId";
import { ContingentRepository } from "@EventOrganizing/Domain/Contingent/ContingentRepository";

export class SetContingentToUnlimitedContingentCommand {
    public constructor(public readonly contingentId: ContingentId) {}
}

@Injectable()
@CommandHandler(SetContingentToUnlimitedContingentCommand)
export class SetContingentToUnlimitedContingentCommandHandler
    implements ICommandHandler<SetContingentToUnlimitedContingentCommand>
{
    public constructor(
        @Inject(EventStore)
        private readonly eventStore: EventStore,
        @Inject(ContingentRepository)
        private readonly contingentRepository: ContingentRepository
    ) {}

    public async execute(command: SetContingentToUnlimitedContingentCommand): Promise<void> {
        const contingent = await this.contingentRepository.findOneById(command.contingentId);

        contingent.setToUnlimited();

        await this.eventStore.append(contingent.dequeueEvents());
    }
}
