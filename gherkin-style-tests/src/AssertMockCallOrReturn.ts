import { MethodToStub } from "ts-mockito/lib/MethodToStub";
import { AssertMockCall } from "./AssertMockCall";
import { capturedResult } from "./functions";

export class AssertMockCallOrReturn extends AssertMockCall {
    protected getAnd() {
        return new AndAssertMockCallOrReturn();
    }

    public shouldHaveBeenReturned() {
        if (typeof this.expectation === "function") {
            try {
                expect(this.expectation(capturedResult)).toBeTruthy();
            } catch (e) {
                if (e.message.includes("toBeTruthy")) {
                    throw new Error(
                        "Actual value received from fixture does not match provided truth test\n\nReceived value: " +
                            capturedResult +
                            "\nReceived type: " +
                            typeof capturedResult
                    );
                }

                throw e;
            }
        } else {
            expect(capturedResult).toBe(this.expectation);
        }

        return this.getAnd();
    }
}

export class AndAssertMockCallOrReturn {
    public and(
        expectation:
            | string
            | number
            | bigint
            | boolean
            | undefined
            | object
            | void
            | MethodToStub
            | ((fixtureResult: any) => boolean)
    ) {
        return new AssertMockCallOrReturn(expectation);
    }
}
