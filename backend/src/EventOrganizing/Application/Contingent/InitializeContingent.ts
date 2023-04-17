import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject, Injectable } from "@nestjs/common";
import { Optional, PositiveInteger } from "@becklyn/types";
import { EventStore } from "@becklyn/ddd-nest";
import { ContingentId } from "@EventOrganizing/Domain/Contingent/ContingentId";
import { EventId } from "@EventOrganizing/Domain/EventId";
import { Contingent } from "@EventOrganizing/Domain/Contingent/Contingent";

export class InitializeContingentCommand {
    public constructor(
        public readonly contingentId: ContingentId,
        public readonly eventId: EventId,
        public readonly quantity: Optional<PositiveInteger>
    ) {}
}

@Injectable()
@CommandHandler(InitializeContingentCommand)
export class InitializeContingentCommandHandler
    implements ICommandHandler<InitializeContingentCommand>
{
    public constructor(
        @Inject(EventStore)
        private readonly eventStore: EventStore
    ) {}

    public async execute(command: InitializeContingentCommand): Promise<void> {
        const contingent = Contingent.initialize(
            command.contingentId,
            command.eventId,
            command.quantity
        );

        await this.eventStore.append(contingent.dequeueEvents());
    }
}
