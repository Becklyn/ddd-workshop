import { Command, CommandStore as Base } from "@becklyn/ddd";
import { Injectable } from "@nestjs/common";

@Injectable()
export abstract class CommandStore implements Base {
    public abstract append(command: Command): Promise<void>;
}
