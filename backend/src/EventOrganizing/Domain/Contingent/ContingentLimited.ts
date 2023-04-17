import { ContingentEvent } from "./ContingentEvent";
import { PositiveInteger } from "@becklyn/types";

export class ContingentLimited extends ContingentEvent<{
    readonly quantity: PositiveInteger;
}> {
    public get quantity(): PositiveInteger {
        return this.data.quantity;
    }
}
