import Constructable = jest.Constructable;
import { AndAssertMockCall } from "./AssertMockCall";

export class AssertException {
    constructor(private readonly closure?: () => void) {}

    public thenErrorShouldHaveBeenThrown(
        error?: string | Constructable | RegExp | Error
    ): AndAssertMockCall {
        const closure = typeof this.closure === "function" ? this.closure : () => void {};

        expect(closure).toThrow(error);

        return new AndAssertMockCall();
    }

    public async thenErrorShouldHaveBeenThrownAsync(
        error?: string | Constructable | RegExp | Error
    ): Promise<void> {
        const closure = typeof this.closure === "function" ? this.closure : async () => void {};
        await expect(closure).rejects.toThrow(error);
    }

    public thenErrorShouldNotHaveBeenThrown(
        error?: string | Constructable | RegExp | Error
    ): AndAssertMockCall {
        const closure = typeof this.closure === "function" ? this.closure : () => void {};

        expect(closure).not.toThrow(error);

        return new AndAssertMockCall();
    }

    public async thenErrorShouldNotHaveBeenThrownAsync(
        error?: string | Constructable | RegExp | Error
    ): Promise<void> {
        const closure = typeof this.closure === "function" ? this.closure : async () => void {};
        await expect(closure).rejects.not.toThrow(error);
    }
}
