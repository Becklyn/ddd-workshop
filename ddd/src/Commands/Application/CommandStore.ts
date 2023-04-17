import { Command } from "../Domain/Command";

export interface CommandStore {
    append(command: Command): Promise<void>;
}
