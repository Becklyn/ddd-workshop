import { ContingentEvent } from "@EventOrganizing/Domain/Contingent/ContingentEvent";
import { PositiveInteger } from "@becklyn/types";

export class ContingentSold extends ContingentEvent<{
    readonly quantity: PositiveInteger;
}> {
    public get quantity(): PositiveInteger {
        return this.data.quantity;
    }
}
