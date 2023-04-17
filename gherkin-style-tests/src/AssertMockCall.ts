import { capture, verify } from "ts-mockito";

export class AssertMockCall {
    constructor(protected readonly expectation: any) {}

    protected getAnd() {
        return new AndAssertMockCall();
    }

    public shouldHaveBeenCalled() {
        verify(this.expectation).called();
        return this.getAnd();
    }

    public shouldHaveBeenCalledOnce() {
        verify(this.expectation).once();
        return this.getAnd();
    }

    public shouldHaveBeenCalledTimes(times: number) {
        verify(this.expectation).times(times);
        return this.getAnd();
    }

    public shouldHaveBeenCalledAtLeastTimes(times: number) {
        verify(this.expectation).atLeast(times);
        return this.getAnd();
    }

    public shouldHaveBeenCalledAtMostTimes(times: number) {
        verify(this.expectation).atMost(times);
        return this.getAnd();
    }

    public shouldHaveBeenCalledBefore(otherExpectedCall: any) {
        verify(this.expectation).calledBefore(otherExpectedCall);
        return this.getAnd();
    }

    public shouldHaveBeenCalledAfter(otherExpectedCall: any) {
        verify(this.expectation).calledAfter(otherExpectedCall);
        return this.getAnd();
    }

    public shouldNotHaveBeenCalled() {
        verify(this.expectation).never();
        return this.getAnd();
    }

    public shouldHaveBeenPassedTo(mockMethod: any) {
        return this.shouldHaveBeenPassedToFirstCallOf(mockMethod);
    }

    public shouldHaveBeenPassedToFirstCallOf(mockMethod: any) {
        this.throwShouldHaveBeenPassedToArgError("shouldHaveBeenPassedToFirstCallOf");

        this.expectShouldHaveBeenPassed(capture(mockMethod).first());

        return this.getAnd();
    }

    private throwShouldHaveBeenPassedToArgError(methodName: string) {
        if (!Array.isArray(this.expectation)) {
            throw new Error(
                `${methodName} can only be used if the provided expectation is an array of values or truth tests`
            );
        }
    }

    private expectShouldHaveBeenPassed(args: unknown[]) {
        this.expectation.forEach((expectation: any, index: number) => {
            const argument = args[index];

            if (typeof expectation === "function") {
                expect(expectation(argument)).toBeTruthy();
            } else {
                expect(argument == expectation).toBeTruthy();
            }
        });
    }

    public shouldHaveBeenPassedToLastCallOf(mockMethod: any) {
        this.throwShouldHaveBeenPassedToArgError("shouldHaveBeenPassedToLastCallOf");

        this.expectShouldHaveBeenPassed(capture(mockMethod).last());

        return this.getAnd();
    }

    public shouldHaveBeenPassedToNthCallOf(mockMethod: any, callIndex: number) {
        this.throwShouldHaveBeenPassedToArgError("shouldHaveBeenPassedToNthCallOf");

        this.expectShouldHaveBeenPassed(capture(mockMethod).byCallIndex(callIndex));

        return this.getAnd();
    }
}

export class AndAssertMockCall {
    public and(expectation: any) {
        return new AssertMockCall(expectation);
    }
}
