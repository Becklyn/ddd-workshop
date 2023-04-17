import { ContingentEvent } from "@EventOrganizing/Domain/Contingent/ContingentEvent";
import { Optional, OptionalValue, PositiveInteger } from "@becklyn/types";
import { EntityIdString } from "@becklyn/ddd";
import { EventId } from "@EventOrganizing/Domain/EventId";

export class ContingentInitialized extends ContingentEvent<{
    readonly eventId: EntityIdString;
    readonly quantity: OptionalValue<PositiveInteger>;
}> {
    public get eventId(): EventId {
        return EventId.fromString(EventId, this.data.eventId);
    }

    public get quantity(): Optional<PositiveInteger> {
        return Optional.fromValue(this.data.quantity);
    }
}
