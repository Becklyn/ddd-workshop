import { TransactionManager as Base } from "@becklyn/ddd";
import { Injectable } from "@nestjs/common";

@Injectable()
export abstract class TransactionManager implements Base {
    public abstract begin(): Promise<void>;

    public abstract commit(): Promise<void>;

    public abstract rollback(): Promise<void>;
}
