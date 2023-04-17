import { DomainEvent } from "./DomainEvent";
import { AggregateId, Id, MessageId } from "../../Identity";
import { EventId } from "./EventId";
import { then, when } from "@becklyn/gherkin-style-tests";
import { OptionalValue } from "@becklyn/types";
import { Command } from "../../Commands/Domain/Command";

class TestAggregateId extends AggregateId {}

// own props must always be readonly, and they must all be primitives otherwise serialization won't work
class TestEvent extends DomainEvent<TestAggregateId, { readonly foo: string }> {
    get aggregateId(): TestAggregateId {
        return TestAggregateId.fromString(TestAggregateId, this.data.aggregateId);
    }

    // we should always create getters for own props, this is especially important for props which should be represented
    // as value objects in the domain (but they must be stored as primitives in the event data)
    get foo(): string {
        return this.data.foo;
    }
}

// this class is for testing invalid own props that can only be detected at runtime
class TestEventWithDynamicOwnProps extends DomainEvent<TestAggregateId, Record<string, any>> {
    get aggregateId(): TestAggregateId {
        return TestAggregateId.fromString(TestAggregateId, this.data.aggregateId);
    }
}

class TestCommand extends Command {
    public constructor() {
        super();
    }
}

describe("DomainEvent", () => {
    describe("constructor", () => {
        it("successfully initializes base domain event data", () => {
            const aggregateId = TestAggregateId.next(TestAggregateId);
            const eventId = EventId.next(EventId);
            const raisedAt = new Date();

            const event = new TestEvent(eventId, raisedAt, aggregateId, { foo: "bar" });
            expect(event.id.asString()).toBe(eventId.asString());
            expect(event.aggregateId.asString()).toBe(aggregateId.asString());
            expect(event.raisedAt.getTime()).toBe(raisedAt.getTime());
        });

        it("successfully initializes own props if they're primitives", () => {
            const ownProps = { foo: "abrakadabra" };

            const event = new TestEvent(
                EventId.next(EventId),
                new Date(),
                TestAggregateId.next(TestAggregateId),
                ownProps
            );

            expect(event.data.foo).toBe(ownProps.foo);
            expect(event.foo).toBe(ownProps.foo);
        });

        it("successfully initializes own props if they're nested primitives (or in a nested array)", () => {
            [{ foo: { bar: null } }, { foo: { bar: ["abrakadabra"] } }].forEach(ownProps => {
                const event = new TestEventWithDynamicOwnProps(
                    EventId.next(EventId),
                    new Date(),
                    TestAggregateId.next(TestAggregateId),
                    ownProps
                );

                expect(event.data.foo).toBe(ownProps.foo);
            });
        });

        it("throws error if own props is an array", () => {
            expect(
                () =>
                    new TestEventWithDynamicOwnProps(
                        EventId.next(EventId),
                        new Date(),
                        TestAggregateId.next(TestAggregateId),
                        []
                    )
            ).toThrow();
        });

        it("throws error if own props is instance of a class (including nested or in a nested array)", () => {
            [
                TestAggregateId.next(TestAggregateId),
                { foo: { bar: TestAggregateId.next(TestAggregateId) } },
                { foo: { bar: [TestAggregateId.next(TestAggregateId)] } },
            ].forEach(ownProps => {
                expect(
                    () =>
                        new TestEventWithDynamicOwnProps(
                            EventId.next(EventId),
                            new Date(),
                            TestAggregateId.next(TestAggregateId),
                            ownProps
                        )
                ).toThrow();
            });
        });

        it("throws error if own props is a function (including nested or in a nested array)", () => {
            [() => 1, { foo: { bar: () => 1 } }, { foo: { bar: [() => 1] } }].forEach(ownProps => {
                expect(
                    () =>
                        new TestEventWithDynamicOwnProps(
                            EventId.next(EventId),
                            new Date(),
                            TestAggregateId.next(TestAggregateId),
                            ownProps
                        )
                ).toThrow();
            });
        });
    });

    describe("aggregateType", () => {
        it("returns class name of belonging aggregate", () => {
            const aggregateId = TestAggregateId.next(TestAggregateId);
            const event = new TestEvent(EventId.next(EventId), new Date(), aggregateId, {
                foo: "bar",
            });
            when(event.aggregateType);
            then(aggregateId.aggregateType).shouldHaveBeenReturned();
        });
    });

    describe("correlateWith", () => {
        let otherMessage: TestCommand;

        beforeEach(() => {
            const firstMessage = new TestCommand();
            const secondMessage = new TestCommand();
            secondMessage.correlateWith(firstMessage);

            expect(secondMessage.id.equals(secondMessage.correlationId)).toBeFalsy();

            otherMessage = secondMessage;
        });

        it("sets correlation id to the correlation id of correlated message ", () => {
            const event = new TestEvent(
                EventId.next(EventId),
                new Date(),
                TestAggregateId.next(TestAggregateId),
                { foo: "bar" }
            );
            event.correlateWith(otherMessage);

            expect(event.correlationId.equals(otherMessage.correlationId)).toBeTruthy();

            class FooId extends Id {}
            const fooId = FooId.next(FooId);
            const messageId = MessageId.fromString(MessageId, fooId.asString());
            expect(messageId.equals(fooId)).toBeFalsy();
        });

        it("sets causation id to the id of correlated message ", () => {
            const event = new TestEvent(
                EventId.next(EventId),
                new Date(),
                TestAggregateId.next(TestAggregateId),
                { foo: "bar" }
            );
            event.correlateWith(otherMessage);

            expect(event.causationId.equals(otherMessage.id)).toBeTruthy();
        });
    });

    describe("correlationId", () => {
        it("throws an Error if event hasn't yet been correlated", () => {
            const event = new TestEvent(
                EventId.next(EventId),
                new Date(),
                TestAggregateId.next(TestAggregateId),
                { foo: "bar" }
            );

            expect(() => event.correlationId).toThrowError();
        });
    });

    describe("causationId", () => {
        it("throws an Error if event hasn't yet been correlated", () => {
            const event = new TestEvent(
                EventId.next(EventId),
                new Date(),
                TestAggregateId.next(TestAggregateId),
                { foo: "bar" }
            );

            expect(() => event.causationId).toThrowError();
        });
    });
});

// This is effectively a test that types can be passed as own prop types to events - if something in the DomainEvent
// changes so that it is not possible anymore, TS will throw a compile error
type TestType = {
    prop: string;
};
class EventWithTypePassedAsOwnProps extends DomainEvent<TestAggregateId, TestType> {
    get aggregateId(): TestAggregateId {
        return TestAggregateId.fromString(TestAggregateId, this.data.aggregateId);
    }
    static stub(): void {
        1; // so eslint doesn't complain
    }
}
EventWithTypePassedAsOwnProps.stub(); // this is only so that ts does not complain about the class not being used

// This is effectively a test that interfaces can be passed as own prop types to events - if something in the DomainEvent
// changes so that it is not possible anymore, TS will throw a compile error
interface TestInterface {
    prop: string;
}
class EventWithInterfacePassedAsOwnProps extends DomainEvent<TestAggregateId, TestInterface> {
    get aggregateId(): TestAggregateId {
        return TestAggregateId.fromString(TestAggregateId, this.data.aggregateId);
    }
    static stub(): void {
        1; // so eslint doesn't complain
    }
}
EventWithInterfacePassedAsOwnProps.stub(); // this is only so that ts does not complain about the class not being used

// This is effectively a test that inline shapes can be passed as own prop types to events - if something in the DomainEvent
// changes so that it is not possible anymore, TS will throw a compile error
class EventWithInlineShapePassedAsOwnProps extends DomainEvent<TestAggregateId, { foo: string }> {
    get aggregateId(): TestAggregateId {
        return TestAggregateId.fromString(TestAggregateId, this.data.aggregateId);
    }
    static stub(): void {
        1; // so eslint doesn't complain
    }
}
EventWithInlineShapePassedAsOwnProps.stub(); // this is only so that ts does not complain about the class not being used

// A smoke test for using a complex nested type as own prop type - if something in the DomainEvent
// changes so that it is not possible anymore, TS will throw a compile error
type TypeWithAllArrayableOptionalPrimitives = {
    readonly string: string;
    readonly number: number;
    readonly boolean: boolean;
    readonly optionalString: OptionalValue<string>;
    readonly optionalNumber: OptionalValue<number>;
    readonly optionalBoolean: OptionalValue<boolean>;
    readonly arrayableString: string[];
    readonly arrayableNumber: number[];
    readonly arrayableBoolean: boolean[];
    readonly arrayablePrimitive: string | number | boolean[];
};

type ComplexNestedType = TypeWithAllArrayableOptionalPrimitives & {
    readonly prop: TypeWithAllArrayableOptionalPrimitives;
    readonly nesting1: {
        readonly prop: TypeWithAllArrayableOptionalPrimitives;
        readonly nesting2: {
            readonly prop: TypeWithAllArrayableOptionalPrimitives;
            readonly nesting3: {
                readonly prop: TypeWithAllArrayableOptionalPrimitives;
                readonly nesting4: {
                    readonly prop: TypeWithAllArrayableOptionalPrimitives;
                    readonly nesting5: {
                        readonly prop: TypeWithAllArrayableOptionalPrimitives;
                        readonly nesting6: {
                            readonly prop: TypeWithAllArrayableOptionalPrimitives;
                            readonly nesting7: {
                                readonly prop: TypeWithAllArrayableOptionalPrimitives;
                                readonly nesting8: {
                                    readonly prop: TypeWithAllArrayableOptionalPrimitives;
                                    readonly nesting9: {
                                        readonly prop: TypeWithAllArrayableOptionalPrimitives;
                                        readonly nesting10: {
                                            readonly prop: TypeWithAllArrayableOptionalPrimitives;
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
    };
};

class EventWithComplexNestedTypeAsOwnProps extends DomainEvent<TestAggregateId, ComplexNestedType> {
    get aggregateId(): TestAggregateId {
        return TestAggregateId.fromString(TestAggregateId, this.data.aggregateId);
    }
    static stub(): void {
        1; // so eslint doesn't complain
    }
}

// this is only so that ts does not complain about the class not being used
EventWithComplexNestedTypeAsOwnProps.stub();

// A smoke test for using a complex nested interface as own prop type - if something in the DomainEvent
// changes so that it is not possible anymore, TS will throw a compile error
interface InterfaceWithAllArrayableOptionalPrimitives {
    readonly string: string;
    readonly number: number;
    readonly boolean: boolean;
    readonly optionalString: OptionalValue<string>;
    readonly optionalNumber: OptionalValue<number>;
    readonly optionalBoolean: OptionalValue<boolean>;
    readonly arrayableString: string[];
    readonly arrayableNumber: number[];
    readonly arrayableBoolean: boolean[];
    readonly arrayablePrimitive: string | number | boolean[];
}

interface ComplexNestedInterface extends InterfaceWithAllArrayableOptionalPrimitives {
    readonly prop: InterfaceWithAllArrayableOptionalPrimitives;
    readonly nesting1: {
        readonly prop: InterfaceWithAllArrayableOptionalPrimitives;
        readonly nesting2: {
            readonly prop: InterfaceWithAllArrayableOptionalPrimitives;
            readonly nesting3: {
                readonly prop: InterfaceWithAllArrayableOptionalPrimitives;
                readonly nesting4: {
                    readonly prop: InterfaceWithAllArrayableOptionalPrimitives;
                    readonly nesting5: {
                        readonly prop: InterfaceWithAllArrayableOptionalPrimitives;
                        readonly nesting6: {
                            readonly prop: InterfaceWithAllArrayableOptionalPrimitives;
                            readonly nesting7: {
                                readonly prop: InterfaceWithAllArrayableOptionalPrimitives;
                                readonly nesting8: {
                                    readonly prop: InterfaceWithAllArrayableOptionalPrimitives;
                                    readonly nesting9: {
                                        readonly prop: InterfaceWithAllArrayableOptionalPrimitives;
                                        readonly nesting10: {
                                            readonly prop: InterfaceWithAllArrayableOptionalPrimitives;
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
    };
}

class EventWithComplexNestedInterfaceAsOwnProps extends DomainEvent<
    TestAggregateId,
    ComplexNestedInterface
> {
    get aggregateId(): TestAggregateId {
        return TestAggregateId.fromString(TestAggregateId, this.data.aggregateId);
    }
    static stub(): void {
        1; // so eslint doesn't complain
    }
}

// this is only so that ts does not complain about the class not being used
EventWithComplexNestedInterfaceAsOwnProps.stub();
