export interface TransactionManager {
    begin(): Promise<void>;

    commit(): Promise<void>;

    rollback(): Promise<void>;
}
