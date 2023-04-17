export abstract class Either<Left, Right> {
    public static left<LeftType, RightType>(value: LeftType): Either<LeftType, RightType> {
        return new Left(value);
    }

    public static right<LeftType, RightType>(value: RightType): Either<LeftType, RightType> {
        return new Right(value);
    }

    // Creates a right-sided Either instance with the result of the supplied function, or a left-sided instance
    // with the thrown exception if the function throws an exception
    public static fromTry<LeftType, RightType>(
        callback: () => RightType
    ): Either<LeftType, RightType> {
        try {
            return new Right(callback());
        } catch (e) {
            return new Left(e);
        }
    }

    public static async fromTryAsync<LeftType, RightType>(
        callback: () => Promise<RightType>
    ): Promise<Either<LeftType, RightType>> {
        try {
            return new Right(await callback());
        } catch (e) {
            return new Left(e);
        }
    }

    public abstract isRight(): boolean;

    public abstract isLeft(): boolean;

    public abstract right(): Right;

    public abstract left(): Left;

    // Applies the supplied function over the right side of the Either, if one exists, and returns the transformed value
    // in a new right-sided Either instance, otherwise it returns the Either untouched
    public abstract map<Output>(mapFunction: (value: Right) => Output): Either<Left, Output>;

    // Applies the supplied function over the right side of the Either, if one exists, and returns the transformed value
    // in a new right-sided Either instance, otherwise it returns the Either untouched
    public abstract mapAsync<Output>(
        mapFunction: (value: Right) => Promise<Output>
    ): Promise<Either<Left, Output>>;

    // Applies the supplied function over the left side of the Either, if one exists, and returns the transformed value
    // in a new left-sided Either instance, otherwise it returns the Either untouched
    public abstract leftMap<Output>(mapFunction: (value: Left) => Output): Either<Output, Right>;

    // Applies the supplied function over the left side of the Either, if one exists, and returns the transformed value
    // in a new left-sided Either instance, otherwise it returns the Either untouched
    public abstract leftMapAsync<Output>(
        mapFunction: (value: Left) => Promise<Output>
    ): Promise<Either<Output, Right>>;

    // Calls the supplied function with the right side of the Either if one exists
    public abstract call(callback: (value: Right) => void): Either<Left, Right>;

    // Calls the supplied function with the right side of the Either if one exists
    public abstract callAsync(
        callback: (value: Right) => Promise<void>
    ): Promise<Either<Left, Right>>;

    // Calls the supplied function with the left side of the Either if one exists
    public abstract leftCall(callback: (value: Left) => void): Either<Left, Right>;

    // Calls the supplied function with the left side of the Either if one exists
    public abstract leftCallAsync(
        callback: (value: Left) => Promise<void>
    ): Promise<Either<Left, Right>>;

    // Throws the left side of the Either if it is left-sided
    public abstract throwLeft(): Either<Left, Right>;

    // Calls one of the supplied functions with the corresponding side of the Either
    public abstract callEither(
        leftCallback: (value: Left) => void,
        rightCallback: (value: Right) => void
    ): Either<Left, Right>;

    // Calls one of the supplied functions with the corresponding side of the Either
    public abstract callEitherAsync(
        leftCallback: (value: Left) => Promise<void>,
        rightCallback: (value: Right) => Promise<void>
    ): Promise<Either<Left, Right>>;

    // Applies the supplied function over the existing side of the Either and returns the transformed value
    public abstract fold<Output>(
        leftMapFunction: (value: Left) => Output,
        rightMapFunction: (value: Right) => Output
    ): Output;

    // Applies the supplied function over the existing side of the Either and returns the transformed value
    public abstract unfold<LeftOutput, RightOutput>(
        leftMapFunction: (value: Left) => LeftOutput,
        rightMapFunction: (value: Right) => RightOutput
    ): LeftOutput | RightOutput;

    // throws error if used on either whose right side is not another either
    // returns either whose left side is an either with the left side of the original either on the left and the
    // left side of the nested either on the right, and whose right side is the right side of the nested either
    public abstract pullNestedLeft<NestedLeft, NestedRight>(): Either<
        Either<Left, NestedLeft>,
        NestedRight
    >;

    // throws error if used on either whose left side is not another either
    // folds the nested either on the left side into the type of the nested left side
    // usually used after pullNestedLeft when mapping values through multiple layers of calls that can return eithers
    // with errors
    public abstract leftFoldNestedIntoLeft<NestedLeft, NestedRight>(
        rightMapFunction: (value: NestedRight) => NestedLeft
    ): Either<NestedLeft, Right>;
}

class Left<Left> extends Either<Left, any> {
    public constructor(private readonly value: Left) {
        super();
    }

    public isRight = (): boolean => false;

    public isLeft = (): boolean => true;

    public right = (): any => {
        throw new RightCalledOnLeftEitherError();
    };

    public left = (): Left => this.value;

    // @ts-ignore
    public map = <Output>(mapFunction: (value: any) => Output): Either<Left, Output> => this;

    public mapAsync = async <Output>(
        // @ts-ignore
        mapFunction: (value: any) => Promise<Output>
    ): Promise<Either<Left, Output>> => this;

    public leftMap = <Output>(mapFunction: (value: Left) => Output): Either<Output, any> =>
        new Left<Output>(mapFunction(this.value));

    public leftMapAsync = async <Output>(
        mapFunction: (value: Left) => Promise<Output>
    ): Promise<Either<Output, any>> => new Left<Output>(await mapFunction(this.value));

    // @ts-ignore
    public call = (callback: (value: any) => void): Either<Left, any> => this;

    public callAsync = async (
        // @ts-ignore
        callback: (value: any) => Promise<void>
    ): Promise<Either<Left, any>> => this;

    public leftCall = (callback: (value: Left) => void): Either<Left, any> => {
        callback(this.value);
        return this;
    };

    public leftCallAsync = async (
        callback: (value: Left) => Promise<void>
    ): Promise<Either<Left, any>> => {
        await callback(this.value);
        return this;
    };

    public throwLeft = (): Either<Left, any> => {
        throw this.value;
    };

    public callEither = (
        leftCallback: (value: Left) => void,
        // @ts-ignore
        rightCallback: (value: any) => void
    ): Either<Left, any> => {
        leftCallback(this.value);
        return this;
    };

    public callEitherAsync = async (
        leftCallback: (value: Left) => Promise<void>,
        // @ts-ignore
        rightCallback: (value: any) => Promise<void>
    ): Promise<Either<Left, any>> => {
        await leftCallback(this.value);
        return this;
    };

    // optionally

    public fold = <Output>(
        leftMapFunction: (value: Left) => Output,
        // @ts-ignore
        rightMapFunction: (value: any) => Output
    ): Output => leftMapFunction(this.value);

    public unfold = <LeftOutput, RightOutput>(
        leftMapFunction: (value: Left) => LeftOutput,
        // @ts-ignore
        rightMapFunction: (value: any) => RightOutput
    ): LeftOutput | RightOutput => leftMapFunction(this.value);

    public pullNestedLeft = <NestedLeft, NestedRight>(): Either<
        Either<Left, NestedLeft>,
        NestedRight
    > => new Left<Either<Left, NestedLeft>>(this);

    public leftFoldNestedIntoLeft = <NestedLeft, NestedRight>(
        rightMapFunction: (value: NestedRight) => NestedLeft
    ): Either<NestedLeft, any> => {
        const left = this.left();

        if (!(left instanceof Either)) {
            throw new LeftFoldNestedIntoLeftCalledOnEitherWithoutNestedLeftEitherError();
        }

        return new Left<NestedLeft>(
            left.fold(
                nestedLeft => nestedLeft,
                nestedRight => rightMapFunction(nestedRight)
            )
        );
    };
}

class Right<Right> extends Either<any, Right> {
    public constructor(private readonly value: Right) {
        super();
    }

    public isRight = (): boolean => true;

    public isLeft = (): boolean => false;

    public right = (): Right => this.value;

    public left = (): any => {
        throw new LeftCalledOnRightEitherError();
    };

    public map = <Output>(mapFunction: (value: Right) => Output): Either<any, Output> =>
        new Right<Output>(mapFunction(this.value));

    public mapAsync = async <Output>(
        mapFunction: (value: Right) => Promise<Output>
    ): Promise<Either<any, Output>> => new Right<Output>(await mapFunction(this.value));

    // @ts-ignore
    public leftMap = <Output>(mapFunction: (value: any) => Output): Either<Output, Right> => this;

    public leftMapAsync = async <Output>(
        // @ts-ignore
        mapFunction: (value: any) => Promise<Output>
    ): Promise<Either<Output, Right>> => this;

    public call = (callback: (value: Right) => void): Either<any, Right> => {
        callback(this.value);
        return this;
    };

    public callAsync = async (
        callback: (value: Right) => Promise<void>
    ): Promise<Either<any, Right>> => {
        await callback(this.value);
        return this;
    };

    // @ts-ignore
    public leftCall = (callback: (value: any) => void): Either<any, Right> => this;

    public leftCallAsync = async (
        // @ts-ignore
        callback: (value: any) => Promise<void>
    ): Promise<Either<any, Right>> => this;

    public throwLeft = (): Either<any, Right> => this;

    public callEither = (
        // @ts-ignore
        leftCallback: (value: any) => void,
        rightCallback: (value: Right) => void
    ): Either<any, Right> => {
        rightCallback(this.value);
        return this;
    };

    public callEitherAsync = async (
        // @ts-ignore
        leftCallback: (value: any) => Promise<void>,
        rightCallback: (value: Right) => Promise<void>
    ): Promise<Either<any, Right>> => {
        await rightCallback(this.value);
        return this;
    };

    // optionally

    public fold = <Output>(
        // @ts-ignore
        leftMapFunction: (value: any) => Output,
        rightMapFunction: (value: Right) => Output
    ): Output => rightMapFunction(this.value);

    public unfold = <LeftOutput, RightOutput>(
        // @ts-ignore
        leftMapFunction: (value: any) => LeftOutput,
        rightMapFunction: (value: Right) => RightOutput
    ): LeftOutput | RightOutput => rightMapFunction(this.value);

    public pullNestedLeft = <NestedLeft, NestedRight>(): Either<
        Either<any, NestedLeft>,
        NestedRight
    > => {
        const right = this.right();

        if (!(right instanceof Either)) {
            throw new PullNestedLeftCalledOnEitherWithoutNestedRightEitherError();
        }

        if (right.isLeft()) {
            return new Left<Either<any, NestedLeft>>(new Right<NestedLeft>(right.left()));
        }

        return new Right<NestedRight>(right.right());
    };

    public leftFoldNestedIntoLeft = <NestedLeft, NestedRight>(
        // @ts-ignore
        rightMapFunction: (value: NestedRight) => NestedLeft
    ): Either<NestedLeft, Right> => this;
}

export class WrongSideGetterCalledOnEitherError extends Error {}

export class LeftCalledOnRightEitherError extends WrongSideGetterCalledOnEitherError {
    public constructor() {
        super("'left()' called on a right Either");
    }
}

export class RightCalledOnLeftEitherError extends WrongSideGetterCalledOnEitherError {
    public constructor() {
        super("'right()' called on a left Either");
    }
}

export class PullNestedLeftCalledOnEitherWithoutNestedRightEitherError extends Error {
    public constructor() {
        super("'pullNestedLeft()' called on an Either whose right side is not another Either");
    }
}

export class LeftFoldNestedIntoLeftCalledOnEitherWithoutNestedLeftEitherError extends Error {
    public constructor() {
        super(
            "'leftFoldNestedIntoLeft()' called on an Either whose left side is not another Either"
        );
    }
}
