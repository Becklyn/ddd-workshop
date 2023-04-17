import { when } from "ts-mockito";

export class GivenMockCall {
    constructor(private readonly mockCall: any) {}

    public returns(value: any) {
        when(this.mockCall).thenReturn(value);

        return new AndGivenMockCall();
    }

    public throws(error: Error) {
        when(this.mockCall).thenThrow(error);

        return new AndGivenMockCall();
    }
}

export class AndGivenMockCall {
    public and(mockCall: any) {
        return new GivenMockCall(mockCall);
    }
}
