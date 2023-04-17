import { CommandBus as Base } from "@becklyn/ddd";
import { Injectable } from "@nestjs/common";

@Injectable()
export abstract class CommandBus extends Base {}
