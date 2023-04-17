import { then, when } from "@becklyn/gherkin-style-tests";
import { anything, instance, mock } from "ts-mockito";
import {
    Either,
    LeftCalledOnRightEitherError,
    LeftFoldNestedIntoLeftCalledOnEitherWithoutNestedLeftEitherError,
    PullNestedLeftCalledOnEitherWithoutNestedRightEitherError,
    RightCalledOnLeftEitherError,
} from "./Either";

describe("Either", () => {
    describe("static left", () => {
        it("returns left-sided instance with supplied value", () => {
            const value = 1;
            when(Either.left(value).left());
            then(value).shouldHaveBeenReturned();
        });
    });

    describe("static right", () => {
        it("returns right-sided instance with supplied value", () => {
            const value = 1;
            when(Either.right(value).right());
            then(value).shouldHaveBeenReturned();
        });
    });

    describe("fromTry", () => {
        it("returns right-sided instance with result of supplied function", () => {
            when(Either.fromTry(() => 1).right());
            then(1).shouldHaveBeenReturned();
        });

        it("returns left-sided instance with thrown exception if supplied function throws it", () => {
            when(
                Either.fromTry<Error, any>(() => {
                    throw new Error("foo");
                }).left().message
            );
            then("foo").shouldHaveBeenReturned();
        });
    });

    describe("isLeft", () => {
        it("returns true if instance is left-sided", () => {
            when(Either.left(1).isLeft());
            then(true).shouldHaveBeenReturned();
        });

        it("returns false if instance is left-sided", () => {
            when(Either.right(1).isLeft());
            then(false).shouldHaveBeenReturned();
        });
    });

    describe("isRight", () => {
        it("returns true if instance is right-sided", () => {
            when(Either.right(1).isRight());
            then(true).shouldHaveBeenReturned();
        });

        it("returns false if instance is right-sided", () => {
            when(Either.left(1).isRight());
            then(false).shouldHaveBeenReturned();
        });
    });

    describe("left", () => {
        it("returns left-side value if it exists", () => {
            when(Either.left(1).left());
            then(1).shouldHaveBeenReturned();
        });

        it("throws error if instance is right-sided", () => {
            when(() => Either.right(1).left()).thenErrorShouldHaveBeenThrown(
                LeftCalledOnRightEitherError
            );
        });
    });

    describe("right", () => {
        it("returns right-side value if it exists", () => {
            when(Either.right(1).right());
            then(1).shouldHaveBeenReturned();
        });

        it("throws error if instance is left-sided", () => {
            when(() => Either.left(1).right()).thenErrorShouldHaveBeenThrown(
                RightCalledOnLeftEitherError
            );
        });
    });

    describe("map", () => {
        it("transforms the right-side value with the supplied callback and returns a new right-side instance with transformed value, if the right side exists", () => {
            when(
                Either.right(1)
                    .map(arg => arg + 1)
                    .right()
            );
            then(2).shouldHaveBeenReturned();
        });

        it("returns untouched instance if it is left-sided", () => {
            when(
                Either.left(1)
                    .map((arg: any) => arg + 1)
                    .left()
            );
            then(1).shouldHaveBeenReturned();
        });
    });

    describe("leftMap", () => {
        it("transforms the left-side value with the supplied callback and returns a new left-side instance with transformed value, if the left side exists", () => {
            when(
                Either.left(1)
                    .leftMap(arg => arg + 1)
                    .left()
            );
            then(2).shouldHaveBeenReturned();
        });

        it("returns untouched instance if it is right-sided", () => {
            when(
                Either.right(1)
                    .leftMap((arg: any) => arg + 1)
                    .right()
            );
            then(1).shouldHaveBeenReturned();
        });
    });

    describe("call", () => {
        it("executes the supplied callback with the right side value if it exists", () => {
            const callerMock = mock<{
                callback(arg: number): void;
            }>();
            const caller = instance(callerMock);

            when(Either.right(1).call(caller.callback));
            then(callerMock.callback(1)).shouldHaveBeenCalled();
        });

        it("doesn't execute the supplied callback if right side does not exist", () => {
            const callerMock = mock<{
                callback(arg: number): void;
            }>();
            const caller = instance(callerMock);

            when(Either.left(1).call(caller.callback));
            then(callerMock.callback(anything())).shouldNotHaveBeenCalled();
        });
    });

    describe("callAsync", () => {
        it("executes the supplied callback with the right side value if it exists", async () => {
            const callerMock = mock<{
                callback(arg: number): Promise<void>;
            }>();
            const caller = instance(callerMock);

            when(await Either.right(1).callAsync(caller.callback));
            then(callerMock.callback(1)).shouldHaveBeenCalled();
        });

        it("doesn't execute the supplied callback if right side does not exist", async () => {
            const callerMock = mock<{
                callback(arg: number): Promise<void>;
            }>();
            const caller = instance(callerMock);

            when(await Either.left(1).callAsync(caller.callback));
            then(callerMock.callback(anything())).shouldNotHaveBeenCalled();
        });
    });

    describe("leftCall", () => {
        it("executes the supplied callback with the left side value if it exists", () => {
            const callerMock = mock<{
                callback(arg: number): void;
            }>();
            const caller = instance(callerMock);

            when(Either.left(1).leftCall(caller.callback));
            then(callerMock.callback(1)).shouldHaveBeenCalled();
        });

        it("doesn't execute the supplied callback if left side does not exist", () => {
            const callerMock = mock<{
                callback(arg: number): void;
            }>();
            const caller = instance(callerMock);

            when(Either.right(1).leftCall(caller.callback));
            then(callerMock.callback(anything())).shouldNotHaveBeenCalled();
        });
    });

    describe("leftCallAsync", () => {
        it("executes the supplied callback with the left side value if it exists", async () => {
            const callerMock = mock<{
                callback(arg: number): Promise<void>;
            }>();
            const caller = instance(callerMock);

            when(await Either.left(1).leftCallAsync(caller.callback));
            then(callerMock.callback(1)).shouldHaveBeenCalled();
        });

        it("doesn't execute the supplied callback if left side does not exist", async () => {
            const callerMock = mock<{
                callback(arg: number): Promise<void>;
            }>();
            const caller = instance(callerMock);

            when(await Either.right(1).leftCallAsync(caller.callback));
            then(callerMock.callback(anything())).shouldNotHaveBeenCalled();
        });
    });

    describe("throwLeft", () => {
        it("throws left side if it exists", () => {
            when(() => Either.left(new Error("foo")).throwLeft()).thenErrorShouldHaveBeenThrown(
                "foo"
            );
        });

        it("doesn't throw anything if value is not null", () => {
            const optional = Either.right(1);
            when(optional.throwLeft());
            then(optional).shouldHaveBeenReturned();
        });
    });

    describe("callEither", () => {
        describe("if right side exists", () => {
            it("executes the supplied right callback with the right-side value", () => {
                const callerMock = mock<{
                    leftCallback(arg: number): void;
                    rightCallback(arg: number): void;
                }>();
                const caller = instance(callerMock);

                when(Either.right(1).callEither(caller.leftCallback, caller.rightCallback));
                then(callerMock.rightCallback(1)).shouldHaveBeenCalled();
            });

            it("does not execute the supplied left callback", () => {
                const callerMock = mock<{
                    leftCallback(arg: number): void;
                    rightCallback(arg: number): void;
                }>();
                const caller = instance(callerMock);

                when(Either.right(1).callEither(caller.leftCallback, caller.rightCallback));
                then(callerMock.leftCallback(anything())).shouldNotHaveBeenCalled();
            });
        });

        describe("if left side exists", () => {
            it("executes the supplied left callback with the left-side value", () => {
                const callerMock = mock<{
                    leftCallback(arg: number): void;
                    rightCallback(arg: number): void;
                }>();
                const caller = instance(callerMock);

                when(Either.left(1).callEither(caller.leftCallback, caller.rightCallback));
                then(callerMock.leftCallback(1)).shouldHaveBeenCalled();
            });

            it("does not execute the supplied right callback", () => {
                const callerMock = mock<{
                    leftCallback(arg: number): void;
                    rightCallback(arg: number): void;
                }>();
                const caller = instance(callerMock);

                when(Either.left(1).callEither(caller.leftCallback, caller.rightCallback));
                then(callerMock.rightCallback(anything())).shouldNotHaveBeenCalled();
            });
        });
    });

    describe("callEitherAsync", () => {
        describe("if right side exists", () => {
            it("executes the supplied right callback with the right-side value", async () => {
                const callerMock = mock<{
                    leftCallback(arg: number): Promise<void>;
                    rightCallback(arg: number): Promise<void>;
                }>();
                const caller = instance(callerMock);

                when(
                    await Either.right(1).callEitherAsync(caller.leftCallback, caller.rightCallback)
                );
                then(callerMock.rightCallback(1)).shouldHaveBeenCalled();
            });

            it("does not execute the supplied left callback", async () => {
                const callerMock = mock<{
                    leftCallback(arg: number): Promise<void>;
                    rightCallback(arg: number): Promise<void>;
                }>();
                const caller = instance(callerMock);

                when(
                    await Either.right(1).callEitherAsync(caller.leftCallback, caller.rightCallback)
                );
                then(callerMock.leftCallback(anything())).shouldNotHaveBeenCalled();
            });
        });

        describe("if left side exists", () => {
            it("executes the supplied left callback with the left-side value", async () => {
                const callerMock = mock<{
                    leftCallback(arg: number): Promise<void>;
                    rightCallback(arg: number): Promise<void>;
                }>();
                const caller = instance(callerMock);

                when(
                    await Either.left(1).callEitherAsync(caller.leftCallback, caller.rightCallback)
                );
                then(callerMock.leftCallback(1)).shouldHaveBeenCalled();
            });

            it("does not execute the supplied right callback", async () => {
                const callerMock = mock<{
                    leftCallback(arg: number): Promise<void>;
                    rightCallback(arg: number): Promise<void>;
                }>();
                const caller = instance(callerMock);

                when(
                    await Either.left(1).callEitherAsync(caller.leftCallback, caller.rightCallback)
                );
                then(callerMock.rightCallback(anything())).shouldNotHaveBeenCalled();
            });
        });
    });

    describe("fold", () => {
        describe("if right side exists", () => {
            it("transforms it with supplied right map function and returns transformed value", () => {
                when(
                    Either.right(1).fold(
                        () => 1,
                        arg => arg + 1
                    )
                );
                then(2).shouldHaveBeenReturned();
            });

            it("does not execute the supplied left map function", () => {
                const callerMock = mock<{
                    callback(arg: any): number;
                }>();
                const caller = instance(callerMock);

                when(Either.right(1).fold(caller.callback, arg => arg + 1));
                then(callerMock.callback(anything())).shouldNotHaveBeenCalled();
            });
        });

        describe("if left side exists", () => {
            it("transforms it with supplied left map function and returns transformed value", () => {
                when(
                    Either.left(1).fold(
                        arg => arg + 1,
                        () => 1
                    )
                );
                then(2).shouldHaveBeenReturned();
            });

            it("does not execute the supplied right map function", () => {
                const callerMock = mock<{
                    callback(arg: any): number;
                }>();
                const caller = instance(callerMock);

                when(Either.left(1).fold(arg => arg + 1, caller.callback));
                then(callerMock.callback(anything())).shouldNotHaveBeenCalled();
            });
        });
    });

    describe("unfold", () => {
        describe("if right side exists", () => {
            it("transforms it with supplied right map function and returns transformed value", () => {
                when(
                    Either.right(1).unfold(
                        () => "foo",
                        arg => arg + 1
                    )
                );
                then(2).shouldHaveBeenReturned();
            });

            it("does not execute the supplied left map function", () => {
                const callerMock = mock<{
                    callback(arg: any): string;
                }>();
                const caller = instance(callerMock);

                when(Either.right(1).unfold(caller.callback, arg => arg + 1));
                then(callerMock.callback(anything())).shouldNotHaveBeenCalled();
            });
        });

        describe("if left side exists", () => {
            it("transforms it with supplied left map function and returns transformed value", () => {
                when(
                    Either.left(1).unfold(
                        arg => arg + 1,
                        () => "foo"
                    )
                );
                then(2).shouldHaveBeenReturned();
            });

            it("does not execute the supplied right map function", () => {
                const callerMock = mock<{
                    callback(arg: any): string;
                }>();
                const caller = instance(callerMock);

                when(Either.left(1).unfold(arg => arg + 1, caller.callback));
                then(callerMock.callback(anything())).shouldNotHaveBeenCalled();
            });
        });
    });

    describe("pullNestedLeft", () => {
        it("returns left-side instance containing a left-sided either with same value as the original top level either if top level either was left", () => {
            const topLevelEither = Either.left<number, Either<boolean, string>>(2);

            const pulledResult = topLevelEither.pullNestedLeft<boolean, string>();
            expect(pulledResult.isLeft()).toBeTruthy();
            expect(pulledResult.left()).toBeInstanceOf(Either);
            expect(pulledResult.left().isLeft()).toBeTruthy();
            expect(pulledResult.left().left()).toBe(2);
        });

        it("returns left-side instance containing a right-sided either with same value as the nested either if nested either is left", () => {
            const nestedLeft = Either.left<boolean, string>(true);
            const topLevelEither = Either.right<number, Either<boolean, string>>(nestedLeft);

            const pulledResult = topLevelEither.pullNestedLeft<boolean, string>();
            expect(pulledResult.isLeft()).toBeTruthy();
            expect(pulledResult.left()).toBeInstanceOf(Either);
            expect(pulledResult.left().isRight()).toBeTruthy();
            expect(pulledResult.left().right()).toBe(true);
        });

        it("returns right-side instance containing same value as the nested either if nested either is right", () => {
            const nestedRight = Either.right<boolean, string>("foo");
            const topLevelEither = Either.right<number, Either<boolean, string>>(nestedRight);

            const pulledResult = topLevelEither.pullNestedLeft<boolean, string>();
            expect(pulledResult.isRight()).toBeTruthy();
            expect(pulledResult.right()).toBe("foo");
        });

        it("throws error if right side exists but is not a nested either", () => {
            const eitherWithoutNestedEither = Either.right("foo");
            expect(() => eitherWithoutNestedEither.pullNestedLeft()).toThrowError(
                PullNestedLeftCalledOnEitherWithoutNestedRightEitherError
            );
        });
    });

    describe("leftFoldNestedIntoLeft", () => {
        describe("if left side is a nested left-sided either", () => {
            it("returns a left-side instance with the value of the nested either", () => {
                const fixture = Either.left<Either<number, string>, boolean>(Either.left(1));
                expect(
                    fixture
                        .leftFoldNestedIntoLeft<number, string>(stringVal =>
                            parseInt(stringVal, 10)
                        )
                        .left()
                ).toBe(1);
            });
        });

        describe("if left side is a nested right-sided either", () => {
            it("returns a left-side instance with the value of the nested either passed through the map function", () => {
                const fixture = Either.left<Either<number, string>, boolean>(Either.right("1"));
                expect(
                    fixture
                        .leftFoldNestedIntoLeft<number, string>(stringVal =>
                            parseInt(stringVal, 10)
                        )
                        .left()
                ).toBe(1);
            });
        });

        it("returns untouched instance if right-sided", () => {
            const fixture = Either.right<Either<number, string>, boolean>(true);
            expect(
                fixture
                    .leftFoldNestedIntoLeft<number, string>(stringVal => parseInt(stringVal, 10))
                    .right()
            ).toBe(true);
        });

        it("throws error if left side is not a nested either", () => {
            const fixture = Either.left<number, string>(1);
            expect(() => fixture.leftFoldNestedIntoLeft(foo => foo)).toThrow(
                LeftFoldNestedIntoLeftCalledOnEitherWithoutNestedLeftEitherError
            );
        });
    });
});
