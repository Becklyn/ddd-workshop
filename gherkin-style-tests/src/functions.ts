import { instance, mock } from "ts-mockito";
import { MethodToStub } from "ts-mockito/lib/MethodToStub";
import { AssertException } from "./AssertException";
import { AssertMockCallOrReturn } from "./AssertMockCallOrReturn";
import { GivenMockCall } from "./GivenMockCall";

export let capturedResult: any;

export const when = (returnValue: any) => {
    if (typeof returnValue === "function") {
        return new AssertException(returnValue);
    }

    capturedResult = returnValue;

    return new AssertException();
};

export const then = (
    expectation:
        | string
        | number
        | bigint
        | boolean
        | null
        | undefined
        | object
        | void
        | MethodToStub
        | ((fixtureResult: any) => boolean)
) => {
    return new AssertMockCallOrReturn(expectation);
};

export const resetTest = () => (capturedResult = undefined);

export const given = (mockFunction: any) => {
    return new GivenMockCall(mockFunction);
};

export function createMockAndInstance<InstanceType>(
    clazz: new (...args: any[]) => InstanceType
): [InstanceType, InstanceType];
export function createMockAndInstance<InstanceType>(clazz?: any): [InstanceType, InstanceType];
export function createMockAndInstance<InstanceType>(clazz?: any): [InstanceType, InstanceType] {
    const _mock = mock<InstanceType>(clazz);
    const _instance = instance(_mock);
    return [_mock, _instance];
}
