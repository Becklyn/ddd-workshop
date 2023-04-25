import { Body, Controller, Get, Post } from "@nestjs/common";
import { EventId, IdString } from "@becklyn/ddd";
import { CommandBus, EventStore } from "@becklyn/ddd-nest";
import { InitializeContingent } from "@EventOrganizing/Application/Contingent/InitializeContingent";
import { Optional, OptionalValue, PositiveInteger, PositiveIntegerOrZero } from "@becklyn/types";
import { ContingentId } from "@EventOrganizing/Domain/Contingent/ContingentId";
import { IncreaseContingentCommand } from "@EventOrganizing/Application/Contingent/IncreaseContingent";
import { GetContingentDataForEvent } from "@EventOrganizing/Application/Contingent/GetContingentDataForEvent";
import { newDeliveryClient } from "@fraym/crud";

@Controller("event-organizing")
export class EventOrganizingController {
    constructor(
        private readonly initializeContingent: InitializeContingent,
        private readonly eventStore: EventStore,
        private readonly commandBus: CommandBus,
        private readonly getContingentDataForEvent: GetContingentDataForEvent
    ) {}

    @Post("/init-random-contingent")
    public async initializeRandomEventContingentContingent(
        @Body() params: { quantity: OptionalValue<PositiveInteger> }
    ): Promise<{ contingentId: IdString; eventId: IdString }> {
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
    public async readEventsForContingent(@Body() params: { contingentId: IdString }) {
        const events = await this.eventStore.getAggregateStream(
            ContingentId.fromString(ContingentId, params.contingentId)
        );

        return {
            aggregateId: {
                type: events.aggregateId.aggregateType,
                id: events.aggregateId.asString(),
            },
            events: events.events.map(event => ({
                name: event.constructor.name,
                data: event.data,
            })),
        };
    }

    @Post("/increase-contingent")
    public async increaseContingent(
        @Body() params: { contingentId: IdString; quantity: PositiveInteger }
    ): Promise<void> {
        await this.commandBus.dispatch(
            new IncreaseContingentCommand(
                ContingentId.fromString(ContingentId, params.contingentId),
                params.quantity
            )
        );
    }

    @Get("/contingent-for-event")
    public async contingentForEvent(@Body() params: { eventId: IdString }): Promise<{
        contingentId: IdString;
        eventId: IdString;
        quantity: OptionalValue<PositiveInteger>;
        soldQuantity: PositiveIntegerOrZero;
    } | null> {
        const contingentData = await this.getContingentDataForEvent.execute(
            EventId.fromString(EventId, params.eventId)
        );

        if (contingentData.isNull()) {
            return null;
        }

        return {
            contingentId: contingentData.value!.contingentId.asString(),
            eventId: contingentData.value!.eventId.asString(),
            quantity: contingentData.value!.quantity.value,
            soldQuantity: contingentData.value!.soldQuantity,
        };
    }

    @Get("/all-event-data")
    public async allEventData() {
        const crud = await newDeliveryClient();
        const authData = {
            tenantId: "dev",
            scopes: ["FRAYM_AUTH_OWNER"],
            data: {},
        };

        const events = await crud.getDataList<{
            id: string;
            name: string;
            location: string;
            timestampStart: number;
            timestampEnd: number;
            description: string | null;
        }>("Event", authData);
        const ticketTypes = await crud.getDataList<{
            id: string;
            event: string;
            name: string;
            price: number;
            description: string | null;
        }>("EventTicketType", authData);

        return events.data.map(event => ({
            ...event,
            ticketTypes: ticketTypes.data.filter(ticketType => ticketType.event === event.id),
        }));
    }
}
