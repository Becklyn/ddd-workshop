import { DomainEvent } from "@becklyn/ddd";
import { IEventHandler } from "@nestjs/cqrs";

export interface EventHandler<T extends DomainEvent<any, any> = DomainEvent<any, any>>
    extends IEventHandler<T> {
    handle(event: T): Promise<void>;
}
