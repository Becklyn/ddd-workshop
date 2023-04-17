import { then, when } from "@becklyn/gherkin-style-tests";
import { EventConstructorMap, EventConstructorMappingNotFoundError } from "./EventConstructorMap";

describe("EventConstructorMap", () => {
    describe("constructorForEventName", () => {
        it("returns constructor corresponding to supplied event name", () => {
            class Foo {}
            const eventName = "bar";
            when(
                new EventConstructorMap(new Map<string, any>([[eventName, Foo]]))
                    .constructorForEventName(eventName)
                    .right()
            );
            then(() => Foo).shouldHaveBeenReturned();
        });

        it("returns EventConstructorMappingNotFoundError if there is no mapping for the supplied event name", () => {
            const eventName = "foo";
            when(
                new EventConstructorMap(new Map<string, any>([]))
                    .constructorForEventName(eventName)
                    .left()
            );
            then(
                (error: EventConstructorMappingNotFoundError) =>
                    error.message ===
                    `Event type ${eventName} not registered in event constructor map`
            ).shouldHaveBeenReturned();
        });
    });
});
