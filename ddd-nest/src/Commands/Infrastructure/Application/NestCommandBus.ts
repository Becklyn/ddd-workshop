import { CommandBus as Base } from "../../Application/CommandBus";
import { CommandBus } from "@nestjs/cqrs";
import { Injectable } from "@nestjs/common";
import { Command } from "@becklyn/ddd";

@Injectable()
export class NestCommandBus extends Base {
    public constructor(private readonly bus: CommandBus) {
        super();
    }

    protected async dispatchCommandToInfrastructure(command: Command): Promise<void> {
        await this.bus.execute(command);
    }
}
