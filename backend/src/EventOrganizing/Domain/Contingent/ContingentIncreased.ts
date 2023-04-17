import { PositiveInteger } from "@becklyn/types";
import { ContingentEvent } from "./ContingentEvent";

export class ContingentIncreased extends ContingentEvent<{
    readonly quantity: PositiveInteger;
}> {
    public get quantity(): PositiveInteger {
        return this.data.quantity;
    }
}
