import { createMockAndInstance, given, resetTest, then, when } from "./index";
import { anyString, anything, reset } from "ts-mockito";

class FirstDependency {
    public returnSomething(): any {
        return "something";
    }

    public returnSomethingConditionally(condition: string): string {
        return "something " + condition;
    }

    public async returnSomethingAsync(): Promise<string> {
        return "something";
    }
}

interface SecondDependency {
    doSomething(input: any): void;
    doSomethingAsync(input: string): Promise<void>;
}

class Fixture {
    constructor(
        private readonly firstDependency: FirstDependency,
        private readonly secondDependency: SecondDependency
    ) {}

    public execute() {
        this.secondDependency.doSomething(this.firstDependency.returnSomething());
    }

    public async executeAsync(): Promise<string> {
        await this.secondDependency.doSomethingAsync(
            await this.firstDependency.returnSomethingAsync()
        );
        return await this.firstDependency.returnSomethingAsync();
    }

    public executeSecond(input: any): void {
        this.secondDependency.doSomething(input);
    }
}

describe("The gherkin style wrapper can", () => {
    const [firstDependencyMock, firstDependency] = createMockAndInstance(FirstDependency);
    const [secondDependencyMock, secondDependency] = createMockAndInstance<SecondDependency>();

    beforeEach(() => {
        reset(firstDependencyMock);
        reset(secondDependencyMock);
        resetTest();
    });

    describe("expect return values", () => {
        it("to be an exact match", () => {
            const fixture = (arg: number) => arg + 1;

            when(fixture(1));

            then(2).shouldHaveBeenReturned();
        });

        it("to satisfy a truth test", () => {
            const fixture = (arg: number) => arg + 1;

            when(fixture(1));

            then(returnValue => returnValue === 2).shouldHaveBeenReturned();
        });
    });

    describe("expect exceptions", () => {
        it("by their exact message", () => {
            const fixture = () => {
                throw new Error("I am error");
            };

            when(() => fixture()).thenErrorShouldHaveBeenThrown("I am error");

            // to assert errors, the fixture must be executed within a callback due to technical reasons
            // error expectations also must also be chained from 'when' due to technical reasons
            // only an error expectation can be chained from 'when' to otherwise force clean separation between 'given', 'when' and 'then'
        });

        it("by their message according to a regex", () => {
            const fixture = () => {
                throw new Error("I am error");
            };

            when(() => fixture()).thenErrorShouldHaveBeenThrown(/am err/);
        });

        it("by passing an error object", () => {
            const error = new Error("I am error");

            const fixture = () => {
                throw error;
            };

            when(() => fixture()).thenErrorShouldHaveBeenThrown(error);
        });

        it("by passing the constructor of an expected error class", () => {
            class NewError extends Error {}

            const fixture = () => {
                throw new NewError("I am error");
            };

            when(() => fixture()).thenErrorShouldHaveBeenThrown(NewError);
        });

        it("or any error at all", () => {
            const fixture = () => {
                throw new Error("I am error");
            };

            when(() => fixture()).thenErrorShouldHaveBeenThrown();
        });
    });

    describe("mock method calls", () => {
        it("to return values", () => {
            given(firstDependencyMock.returnSomethingConditionally("foo")).returns("bar");

            when(firstDependency.returnSomethingConditionally("foo"));

            then("bar").shouldHaveBeenReturned();
        });

        it("to throw exceptions", () => {
            given(firstDependencyMock.returnSomething()).throws(new Error("I am error"));

            when(() => firstDependency.returnSomething()).thenErrorShouldHaveBeenThrown(
                "I am error"
            );
        });

        it("using various argument matchers provided by ts-mockito", () => {
            given(firstDependencyMock.returnSomethingConditionally(anyString())).returns("bar");

            when(firstDependency.returnSomethingConditionally("foo"));

            then("bar").shouldHaveBeenReturned();
        });
    });

    describe("expect method calls on mocks", () => {
        it("with equal (object identity) argument values", () => {
            const fixture = new Fixture(firstDependency, secondDependency);

            const returnValue = { a: 1 };
            given(firstDependencyMock.returnSomething()).returns(returnValue);

            when(fixture.execute());

            then(secondDependencyMock.doSomething(returnValue)).shouldHaveBeenCalled();

            // you might have noticed a certain ts-mockito requirement: mock objects created by the 'mock' function
            // must be used to mock method calls and expect them, but instantiated objects created by the 'instance'
            // function must actually be injected/executed
        });

        describe("with truth tests for arguments", () => {
            it("for first call of specified method", () => {
                const fixture = new Fixture(firstDependency, secondDependency);

                when(fixture.executeSecond("foo"));
                when(fixture.executeSecond("bar"));

                then([(arg: string) => arg === "foo"]).shouldHaveBeenPassedToFirstCallOf(
                    secondDependencyMock.doSomething
                );
            });

            it("for first call of specified method, with a simpler alias", () => {
                const fixture = new Fixture(firstDependency, secondDependency);

                when(fixture.executeSecond("foo"));
                when(fixture.executeSecond("bar"));

                then([(arg: string) => arg === "foo"]).shouldHaveBeenPassedTo(
                    secondDependencyMock.doSomething
                );
            });

            it("for last call of specified method", () => {
                const fixture = new Fixture(firstDependency, secondDependency);

                when(fixture.executeSecond("foo"));
                when(fixture.executeSecond("bar"));

                then([(arg: string) => arg === "bar"]).shouldHaveBeenPassedToLastCallOf(
                    secondDependencyMock.doSomething
                );
            });

            it("for an indexed call of specified method, with index starting at 0", () => {
                const fixture = new Fixture(firstDependency, secondDependency);

                when(fixture.executeSecond("foo"));
                when(fixture.executeSecond("bar"));
                when(fixture.executeSecond("baz"));

                then([(arg: string) => arg === "bar"]).shouldHaveBeenPassedToNthCallOf(
                    secondDependencyMock.doSomething,
                    1
                );
            });
        });

        it("with equal (object identity) argument values, using any available shouldHaveBeenPassedTo method", () => {
            const fixture = new Fixture(firstDependency, secondDependency);
            const a = { a: 1 };
            when(fixture.executeSecond(a));
            then([a]).shouldHaveBeenPassedTo(secondDependencyMock.doSomething);
        });

        it("using various argument matchers provided by ts-mockito", () => {
            const fixture = new Fixture(firstDependency, secondDependency);

            const returnValue = "something";
            given(firstDependencyMock.returnSomething()).returns(returnValue);

            when(fixture.execute());

            then(secondDependencyMock.doSomething(anything())).shouldHaveBeenCalled();
        });

        it("exactly once", () => {
            const fixture = new Fixture(firstDependency, secondDependency);

            given(firstDependencyMock.returnSomething()).returns("something");

            when(fixture.execute());

            then(secondDependencyMock.doSomething(anything())).shouldHaveBeenCalledOnce();
        });

        it("exact number of times", () => {
            const fixture = new Fixture(firstDependency, secondDependency);

            given(firstDependencyMock.returnSomething()).returns("something");

            when(fixture.execute());

            then(secondDependencyMock.doSomething(anything())).shouldHaveBeenCalledTimes(1);
        });

        it("at least number of times", () => {
            const fixture = new Fixture(firstDependency, secondDependency);

            given(firstDependencyMock.returnSomething()).returns("something");

            when(fixture.execute());

            then(secondDependencyMock.doSomething(anything())).shouldHaveBeenCalledAtLeastTimes(1);
        });

        it("at most number of times", () => {
            const fixture = new Fixture(firstDependency, secondDependency);

            given(firstDependencyMock.returnSomething()).returns("something");

            when(fixture.execute());

            then(secondDependencyMock.doSomething(anything())).shouldHaveBeenCalledAtMostTimes(1);
        });

        it("called before another mock", () => {
            const fixture = new Fixture(firstDependency, secondDependency);

            given(firstDependencyMock.returnSomething()).returns("something");

            when(fixture.execute());

            then(firstDependencyMock.returnSomething()).shouldHaveBeenCalledBefore(
                secondDependencyMock.doSomething(anything())
            );
        });

        it("called after another mock", () => {
            const fixture = new Fixture(firstDependency, secondDependency);

            given(firstDependencyMock.returnSomething()).returns("something");

            when(fixture.execute());

            then(secondDependencyMock.doSomething(anything())).shouldHaveBeenCalledAfter(
                firstDependencyMock.returnSomething()
            );
        });
    });

    describe("fluently chain", () => {
        it("method mocking from 'given'", () => {
            const fixture = new Fixture(firstDependency, secondDependency);

            const returnValue = "something";

            given(firstDependencyMock.returnSomething())
                .returns(returnValue)
                .and(secondDependencyMock.doSomething(anything()))
                .throws(new Error("I am error"));

            when(() => fixture.execute()).thenErrorShouldHaveBeenThrown();

            then(secondDependencyMock.doSomething(returnValue)).shouldHaveBeenCalled();
        });

        it("return value and mock call expectations from 'then'", () => {
            const fixture = (arg: number) => {
                secondDependency.doSomething(arg.toString(10));
                return arg + 1;
            };

            when(fixture(1));

            then(2)
                .shouldHaveBeenReturned()
                .and(secondDependencyMock.doSomething("1"))
                .shouldHaveBeenCalled();
        });

        it("mock call expectations after expecting an exception on 'when'", () => {
            const fixture = new Fixture(firstDependency, secondDependency);

            const returnValue = "something";

            given(firstDependencyMock.returnSomething())
                .returns(returnValue)
                .and(secondDependencyMock.doSomething(anything()))
                .throws(new Error("I am error"));

            when(() => fixture.execute())
                .thenErrorShouldHaveBeenThrown("I am error")
                .and(secondDependencyMock.doSomething(returnValue))
                .shouldHaveBeenCalled();

            // only mock expectations can be chained after an exception expectation because if an exception is thrown
            // no value can be returned
        });
    });

    it("just repeat given and then if you don't like the fluent interface", () => {
        const fixture = new Fixture(firstDependency, secondDependency);

        const returnValue = "something";

        given(firstDependencyMock.returnSomething()).returns(returnValue);
        given(secondDependencyMock.doSomething(anything())).returns(undefined);

        when(fixture.execute());

        then(firstDependencyMock.returnSomething()).shouldHaveBeenCalled();
        then(secondDependencyMock.doSomething(returnValue)).shouldHaveBeenCalled();
    });

    describe("test async code", () => {
        it("for expected return values or mock calls by having the test scenario be async and using await while executing the fixture inside 'when'", async () => {
            const fixture = new Fixture(firstDependency, secondDependency);

            const returnValue = "something";

            given(firstDependencyMock.returnSomethingAsync()).returns(returnValue);

            when(await fixture.executeAsync());

            then(returnValue)
                .shouldHaveBeenReturned()
                .and(secondDependencyMock.doSomethingAsync(returnValue))
                .shouldHaveBeenCalled();

            expect.assertions(1); // only expecting one assertion because mock call assertions via mockito don't count - this is only for jest assertions of return values and exceptions
        });

        it("for expected errors by having the test scenario be async, executing the fixture with await within an async callback passed to 'when', and fluently calling and awaiting thenErrorShouldHaveBeenThrownAsync from 'when'", async () => {
            const fixture = new Fixture(firstDependency, secondDependency);

            given(firstDependencyMock.returnSomethingAsync()).throws(new Error("I am error"));

            await when(async () => await fixture.executeAsync()).thenErrorShouldHaveBeenThrownAsync(
                "I am error"
            );

            expect.assertions(1);
        });

        it("for expected mock calls in a fixture execution that throws an error, using the same way as for testing async errors but expecting mock calls can't be chained from thenErrorShouldHaveBeenThrownAsync and must be done with a separate 'then'", async () => {
            const fixture = new Fixture(firstDependency, secondDependency);

            given(firstDependencyMock.returnSomethingAsync()).throws(new Error("I am error"));

            await when(async () => await fixture.executeAsync()).thenErrorShouldHaveBeenThrownAsync(
                "I am error"
            );

            then(firstDependencyMock.returnSomethingAsync()).shouldHaveBeenCalledOnce();

            expect.assertions(1); // only expecting one assertion because mock call assertions via mockito don't count - this is only for jest assertions of return values and exceptions
        });
    });
});

describe("createMockAndInstance", () => {
    it("returns mock and instance of a class", () => {
        class TestClass {
            testFunction(): void {
                0;
            }
        }

        const [mock, instance] = createMockAndInstance(TestClass);

        expect(mock).toHaveProperty("__tsmockitoInstance");
        expect(mock).toHaveProperty("testFunction");
        expect(instance).toHaveProperty("testFunction");
    });

    it("returns mock and instance of an interface", () => {
        interface TestInterface {
            testInterfaceFunction(): void;
        }

        const [mock, instance] = createMockAndInstance<TestInterface>();

        expect(mock).toHaveProperty("__tsmockitoInstance");
        expect(mock).toHaveProperty("testInterfaceFunction");
        expect(instance).toHaveProperty("testInterfaceFunction");
    });
});
