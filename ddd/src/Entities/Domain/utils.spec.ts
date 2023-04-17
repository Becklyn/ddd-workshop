import { Entity } from "./Entity";
import { AggregateId, EntityId } from "../../Identity";
import { AggregateRoot } from "./AggregateRoot";
import { AggregateEventStream } from "../../Events";
import { then, when } from "@becklyn/gherkin-style-tests";
import { findOneEntityById } from "./utils";

class TestEntityId extends EntityId {}
class TestEntity extends Entity<TestEntityId, any> {
    public constructor(id: TestEntityId) {
        super(id, new Date(), {});
    }
}

class TestAggregateId extends AggregateId {}
class TestAggregateRoot extends AggregateRoot<TestAggregateId, any> {
    public constructor(id: TestAggregateId) {
        super(new AggregateEventStream<TestAggregateId, any>(id, []));
        this.state = {
            id,
            createdAt: new Date(),
        };
    }
}

describe("findOneEntityById", () => {
    it("returns entity matched by id", () => {
        const id = TestEntityId.next(TestEntityId);
        const expected = new TestEntity(id);

        when(findOneEntityById([expected], id).value);
        then(expected).shouldHaveBeenReturned();
    });

    it("returns null if entity matching id can't be found", () => {
        const id = TestEntityId.next(TestEntityId);

        when(findOneEntityById([], id).value);
        then(null).shouldHaveBeenReturned();
    });

    it("returns aggregate root matched by id", () => {
        const id = TestAggregateId.next(TestAggregateId);
        const expected = new TestAggregateRoot(id);

        when(findOneEntityById([expected], id).value);
        then(expected).shouldHaveBeenReturned();
    });

    it("returns null if aggregate root matching id can't be found", () => {
        const id = TestAggregateId.next(TestAggregateId);

        when(findOneEntityById([], id).value);
        then(null).shouldHaveBeenReturned();
    });
});
