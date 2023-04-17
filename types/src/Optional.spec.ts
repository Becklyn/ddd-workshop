import { Optional } from "./Optional";
import { then, when } from "@becklyn/gherkin-style-tests";
import { anything, instance, mock } from "ts-mockito";

describe("Optional", () => {
    describe("fromValue", () => {
        it("returns Optional containing supplied value if it is not null or undefined", () => {
            const value = 1;
            when(Optional.fromValue(value).value);
            then(value).shouldHaveBeenReturned();
        });

        it("returns Optional containing null if it was supplied", () => {
            const value = null;
            when(Optional.fromValue(value).value);
            then(null).shouldHaveBeenReturned();
        });

        it("returns Optional containing null if undefined was supplied", () => {
            const value = undefined;
            when(Optional.fromValue(value).value);
            then(null).shouldHaveBeenReturned();
        });

        it("properly informs TypeScript that supplied undefined was converted to null", () => {
            const foo: string | undefined = undefined;

            when(Optional.fromValue<string>(foo).map<number>((str: string) => str.length).value);
            then(null).shouldHaveBeenReturned();
        });
    });

    describe("null", () => {
        it("returns Optional containing null", () => {
            when(Optional.null().value);
            then(null).shouldHaveBeenReturned();
        });
    });

    describe("valueOrDefault", () => {
        it("returns value if it is not null", () => {
            const value = "foo";
            const def = "bar";
            when(Optional.fromValue(value).valueOrDefault(def));
            then(value).shouldHaveBeenReturned();
        });

        it("returns default if value is null", () => {
            const value = null;
            const def = "bar";
            when(Optional.fromValue<string>(value).valueOrDefault(def));
            then(def).shouldHaveBeenReturned();
        });
    });

    describe("isNull", () => {
        it("returns true if value is null", () => {
            when(Optional.fromValue(null).isNull());
            then(true).shouldHaveBeenReturned();
        });

        it("returns false if value is not null", () => {
            when(Optional.fromValue(1).isNull());
            then(false).shouldHaveBeenReturned();
        });
    });

    describe("isNotNull", () => {
        it("returns true if value is not null", () => {
            when(Optional.fromValue(1).isNotNull());
            then(true).shouldHaveBeenReturned();
        });

        it("returns false if value is null", () => {
            when(Optional.fromValue(null).isNotNull());
            then(false).shouldHaveBeenReturned();
        });
    });

    describe("map", () => {
        it("transforms the value with the passed callback and returns a new instance with transformed value, if initial value is not null", () => {
            when(Optional.fromValue(1).map(arg => arg + 1).value);
            then(2).shouldHaveBeenReturned();
        });

        it("returns  untouched instance if value is null", () => {
            when(Optional.fromValue(null).map((arg: null | number) => (arg ? arg + 1 : 5)).value);
            then(null).shouldHaveBeenReturned();
        });
    });

    describe("call", () => {
        it("executes the supplied callback with the value if it is not null", () => {
            const callerMock = mock<{
                callback(arg: number): void;
            }>();
            const caller = instance(callerMock);

            when(Optional.fromValue(1).call(caller.callback));
            then(callerMock.callback(1)).shouldHaveBeenCalled();
        });

        it("doesn't execute the supplied callback if value is null", () => {
            const callerMock = mock<{
                callback(arg: number | null): void;
            }>();
            const caller = instance(callerMock);

            when(Optional.fromValue(null).call(caller.callback));
            then(callerMock.callback(anything())).shouldNotHaveBeenCalled();
        });
    });

    describe("callAsync", () => {
        it("executes the supplied callback with the value if it is not null", async () => {
            const callerMock = mock<{
                callback(arg: number): Promise<void>;
            }>();
            const caller = instance(callerMock);

            when(await Optional.fromValue(1).callAsync(caller.callback));
            then(callerMock.callback(1)).shouldHaveBeenCalled();
        });

        it("doesn't execute the supplied callback if value is null", async () => {
            const callerMock = mock<{
                callback(arg: number | null): Promise<void>;
            }>();
            const caller = instance(callerMock);

            when(await Optional.fromValue(null).callAsync(caller.callback));
            then(callerMock.callback(anything())).shouldNotHaveBeenCalled();
        });
    });

    describe("callIfNull", () => {
        it("executes the supplied callback if value is null", () => {
            const callerMock = mock<{
                callback(): void;
            }>();
            const caller = instance(callerMock);

            when(Optional.fromValue(null).callIfNull(caller.callback));
            then(callerMock.callback()).shouldHaveBeenCalled();
        });

        it("doesn't execute the supplied callback if value is not null", () => {
            const callerMock = mock<{
                callback(): void;
            }>();
            const caller = instance(callerMock);

            when(Optional.fromValue(1).callIfNull(caller.callback));
            then(callerMock.callback()).shouldNotHaveBeenCalled();
        });
    });

    describe("callIfNullAsync", () => {
        it("executes the supplied callback if value is null", async () => {
            const callerMock = mock<{
                callback(): Promise<void>;
            }>();
            const caller = instance(callerMock);

            when(await Optional.fromValue(null).callIfNullAsync(caller.callback));
            then(callerMock.callback()).shouldHaveBeenCalled();
        });

        it("doesn't execute the supplied callback if value is not null", async () => {
            const callerMock = mock<{
                callback(): Promise<void>;
            }>();
            const caller = instance(callerMock);

            when(await Optional.fromValue(1).callIfNullAsync(caller.callback));
            then(callerMock.callback()).shouldNotHaveBeenCalled();
        });
    });

    describe("throwIfNull", () => {
        it("throws supplied exception if value is null", () => {
            when(() =>
                Optional.fromValue(null).throwIfNull(new Error("foo"))
            ).thenErrorShouldHaveBeenThrown("foo");
        });

        it("doesn't throw supplied exception if value is not null", () => {
            const optional = Optional.fromValue(1);
            when(optional.throwIfNull(new Error()));
            then(optional).shouldHaveBeenReturned();
        });
    });

    describe("callEither", () => {
        it("executes the supplied not null callback with the value if it is not null", () => {
            const callerMock = mock<{
                nullCallback(): void;
                notNullCallback(arg: number): void;
            }>();
            const caller = instance(callerMock);

            when(Optional.fromValue(1).callEither(caller.nullCallback, caller.notNullCallback));
            then(callerMock.notNullCallback(1)).shouldHaveBeenCalled();
        });

        it("does not execute the supplied null callback if value is not null", () => {
            const callerMock = mock<{
                nullCallback(): void;
                notNullCallback(arg: number): void;
            }>();
            const caller = instance(callerMock);

            when(Optional.fromValue(1).callEither(caller.nullCallback, caller.notNullCallback));
            then(callerMock.nullCallback()).shouldNotHaveBeenCalled();
        });

        it("executes the supplied null callback if value is null", () => {
            const callerMock = mock<{
                nullCallback(): void;
                notNullCallback(arg: number | null): void;
            }>();
            const caller = instance(callerMock);

            when(Optional.fromValue(null).callEither(caller.nullCallback, caller.notNullCallback));
            then(callerMock.nullCallback()).shouldHaveBeenCalled();
        });

        it("does not execute the supplied not null callback if value is null", () => {
            const callerMock = mock<{
                nullCallback(): void;
                notNullCallback(arg: number | null): void;
            }>();
            const caller = instance(callerMock);

            when(Optional.fromValue(null).callEither(caller.nullCallback, caller.notNullCallback));
            then(callerMock.notNullCallback(anything())).shouldNotHaveBeenCalled();
        });
    });

    describe("callEitherAsync", () => {
        it("executes the supplied not null callback with the value if it is not null", async () => {
            const callerMock = mock<{
                nullCallback(): Promise<void>;
                notNullCallback(arg: number): Promise<void>;
            }>();
            const caller = instance(callerMock);

            when(
                await Optional.fromValue(1).callEitherAsync(
                    caller.nullCallback,
                    caller.notNullCallback
                )
            );
            then(callerMock.notNullCallback(1)).shouldHaveBeenCalled();
        });

        it("does not execute the supplied null callback if value is not null", async () => {
            const callerMock = mock<{
                nullCallback(): Promise<void>;
                notNullCallback(arg: number): Promise<void>;
            }>();
            const caller = instance(callerMock);

            when(
                await Optional.fromValue(1).callEitherAsync(
                    caller.nullCallback,
                    caller.notNullCallback
                )
            );
            then(callerMock.nullCallback()).shouldNotHaveBeenCalled();
        });

        it("executes the supplied null callback if value is null", async () => {
            const callerMock = mock<{
                nullCallback(): Promise<void>;
                notNullCallback(arg: number | null): Promise<void>;
            }>();
            const caller = instance(callerMock);

            when(
                await Optional.fromValue(null).callEitherAsync(
                    caller.nullCallback,
                    caller.notNullCallback
                )
            );
            then(callerMock.nullCallback()).shouldHaveBeenCalled();
        });

        it("does not execute the supplied not null callback if value is null", async () => {
            const callerMock = mock<{
                nullCallback(): Promise<void>;
                notNullCallback(arg: number | null): Promise<void>;
            }>();
            const caller = instance(callerMock);

            when(
                await Optional.fromValue(null).callEitherAsync(
                    caller.nullCallback,
                    caller.notNullCallback
                )
            );
            then(callerMock.notNullCallback(anything())).shouldNotHaveBeenCalled();
        });
    });

    describe("fold", () => {
        it("transforms value with supplied not null map function and returns transformed value, if initial value is not null", () => {
            when(
                Optional.fromValue(1).fold(
                    () => 1,
                    arg => arg + 1
                )
            );
            then(2).shouldHaveBeenReturned();
        });

        it("returns return value of supplied null map function if initial value is null", () => {
            when(
                Optional.fromValue(null).fold(
                    () => 1,
                    (arg: number | null) => (arg ? 5 : 10)
                )
            );
            then(1).shouldHaveBeenReturned();
        });
    });

    describe("unfold", () => {
        it("transforms value with supplied not null map function and returns transformed value, if initial value is not null", () => {
            when(
                Optional.fromValue(1).unfold(
                    () => "foo",
                    arg => arg + 1
                )
            );
            then(2).shouldHaveBeenReturned();
        });

        it("returns return value of supplied null map function if initial value is null", () => {
            when(
                Optional.fromValue(null).unfold(
                    () => "foo",
                    (arg: number | null) => (arg ? 5 : 10)
                )
            );
            then("foo").shouldHaveBeenReturned();
        });
    });

    describe("assertValue", () => {
        const assertTrue = (value: boolean): void => {
            if (!value) {
                throw new Error("foo");
            }
        };

        const failingValue = false;
        const passingValue = true;

        it("throws error if value fails the assertions", () => {
            when(() => assertTrue(failingValue)).thenErrorShouldHaveBeenThrown();
            when(() =>
                Optional.fromValue(failingValue).assertValue(assertTrue)
            ).thenErrorShouldHaveBeenThrown();
        });

        it("does not throw error if value passes the assertions", () => {
            when(() => assertTrue(passingValue)).thenErrorShouldNotHaveBeenThrown();
            when(() =>
                Optional.fromValue(passingValue).assertValue(assertTrue)
            ).thenErrorShouldNotHaveBeenThrown();
        });

        it("does not throw error if value is null", () => {
            when(() => Optional.null().assertValue(assertTrue)).thenErrorShouldNotHaveBeenThrown();
        });
    });
});
