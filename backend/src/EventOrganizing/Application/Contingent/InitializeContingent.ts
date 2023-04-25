import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject, Injectable } from "@nestjs/common";
import { Optional, PositiveInteger } from "@becklyn/types";
import { EventStore } from "@becklyn/ddd-nest";
import { ContingentId } from "@EventOrganizing/Domain/Contingent/ContingentId";
import { EventId } from "@EventOrganizing/Domain/EventId";
import { Contingent } from "@EventOrganizing/Domain/Contingent/Contingent";
import { CommandBus } from "@becklyn/ddd-nest";
import { Command } from "@becklyn/ddd";
import { ContingentRepository } from "@EventOrganizing/Domain/Contingent/ContingentRepository";

export class InitializeContingentCommand extends Command {
    public constructor(
        public readonly contingentId: ContingentId,
        public readonly eventId: EventId,
        public readonly quantity: Optional<PositiveInteger>
    ) {
        super();
    }
}

@Injectable()
@CommandHandler(InitializeContingentCommand)
export class InitializeContingentCommandHandler
    implements ICommandHandler<InitializeContingentCommand>
{
    public constructor(
        @Inject(ContingentRepository)
        private readonly contingentRepository: ContingentRepository,
        @Inject(EventStore)
        private readonly eventStore: EventStore
    ) {}

    public async execute(command: InitializeContingentCommand): Promise<void> {
        let existingContingent: Contingent | null = null;

        try {
            existingContingent = await this.contingentRepository.findOneByEventId(command.eventId);
        } catch (e) {}

        if (existingContingent) {
            throw new Error("Contingent already exists for this event");
        }

        const contingent = Contingent.initialize(
            command.contingentId,
            command.eventId,
            command.quantity
        );

        await this.eventStore.append(contingent.dequeueEvents());
    }
}

@Injectable()
export class InitializeContingent {
    public constructor(
        @Inject(ContingentRepository)
        private readonly contingentRepository: ContingentRepository,
        @Inject(CommandBus)
        private readonly commandBus: CommandBus
    ) {}

    public async execute(
        eventId: EventId,
        quantity: Optional<PositiveInteger>
    ): Promise<ContingentId> {
        const newContingentId = this.contingentRepository.nextId();

        await this.commandBus.dispatch(
            new InitializeContingentCommand(newContingentId, eventId, quantity)
        );

        return newContingentId;
    }
}
