import { v4 as uuidV4, validate } from "uuid";
import { UuidString } from "@becklyn/types";

export type IdString = UuidString;

export abstract class Id {
    public constructor(protected id: IdString) {
        if (!validate(id)) {
            throw new Error(`Attempted to generate id from non-uuid string ${id}`);
        }
    }

    public static next = <T extends Id>(ctor: new (id: IdString) => T): T => new ctor(uuidV4());

    public static fromString = <T extends Id>(ctor: new (id: IdString) => T, id: IdString): T =>
        new ctor(id);

    public asString = (): IdString => this.id;

    public equals = (other: Id): boolean =>
        this.id === other.id && this.constructor === other.constructor;
}
