import { Body, Controller, Get, Post } from "@nestjs/common";
import { EventId } from "@becklyn/ddd";
import { CommandBus, EventStore } from "@becklyn/ddd-nest";
import { InitializeContingent } from "@EventOrganizing/Application/Contingent/InitializeContingent";
import { Optional } from "@becklyn/types";
import { ContingentId } from "@EventOrganizing/Domain/Contingent/ContingentId";
import { deepConsoleLog } from "@Utils/DeepConsoleLog";
import { IncreaseContingentCommand } from "@EventOrganizing/Application/Contingent/IncreaseContingent";

@Controller("event-organizing")
export class EventOrganizingController {
    constructor(
        private readonly initializeContingent: InitializeContingent,
        private readonly eventStore: EventStore,
        private readonly commandBus: CommandBus
    ) {}

    @Post("/init-random-contingent")
    public async initializeRandomEventContingentContingent(
        @Body() params: { quantity: number | null }
    ): Promise<{ contingentId: string; eventId: string }> {
        const eventId = EventId.next(EventId);

        const contingentId = await this.initializeContingent.execute(
            eventId,
            Optional.fromValue(params.quantity)
        );

        return {
            contingentId: contingentId.asString(),
            eventId: eventId.asString(),
        };
    }

    @Get("/read-contingent-events")
    public async readEventsForContingent(@Body() params: { contingentId: string }): Promise<void> {
        const events = await this.eventStore.getAggregateStream(
            ContingentId.fromString(ContingentId, params.contingentId)
        );

        deepConsoleLog(events);
    }

    @Post("/increase-contingent")
    public async increaseContingent(
        @Body() params: { contingentId: string; quantity: number }
    ): Promise<void> {
        await this.commandBus.dispatch(
            new IncreaseContingentCommand(
                ContingentId.fromString(ContingentId, params.contingentId),
                params.quantity
            )
        );
    }
}
