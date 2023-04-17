import { Injectable } from "@nestjs/common";
import { Either } from "@becklyn/types";

@Injectable()
export class EventConstructorMap {
    public constructor(private readonly map: Map<string, any>) {}

    public constructorForEventName(
        eventName: string
    ): Either<EventConstructorMappingNotFoundError, any> {
        if (!this.map.has(eventName)) {
            return Either.left(new EventConstructorMappingNotFoundError(eventName));
        }

        return Either.right(this.map.get(eventName));
    }
}

export class EventConstructorMappingNotFoundError extends Error {
    public constructor(eventName: string) {
        super(`Event type ${eventName} not registered in event constructor map`);
    }
}
