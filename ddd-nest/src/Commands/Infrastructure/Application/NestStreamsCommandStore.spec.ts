import { Command } from "@becklyn/ddd";
import { createMockAndInstance, given, resetTest, then, when } from "@becklyn/gherkin-style-tests";
import { Client, PublishEvent } from "@fraym/streams";
import { reset } from "ts-mockito";
import { NestStreamsCommandStore } from "./NestStreamsCommandStore";
import { StreamsService } from "../../../Events";

class TestCommand extends Command {
    constructor(public readonly someData: any) {
        super();
    }
}

describe("NestStreamsCommandStore", () => {
    const [streamsServiceMock, streamsService] = createMockAndInstance<StreamsService>();
    const [clientMock, client] = createMockAndInstance<Client>();
    given(streamsServiceMock.client).returns(client);

    beforeEach(async () => {
        reset(clientMock);
        resetTest();
    });

    describe("append", () => {
        it("publishes serialized command to specified topic for specified tenant", async () => {
            const tenantId = "test";
            const topic = "foo";
            const fixture = new NestStreamsCommandStore(tenantId, topic, streamsService);

            const payload = { someData: "bar", otherData: [{ foo: "meh" }, { boo: "bla" }] };
            const command = new TestCommand(payload);

            when(await fixture.append(command));

            then([
                (passedTopic: string) => passedTopic === topic,
                (publishedCommands: PublishEvent[]) => {
                    const serializedCommand = publishedCommands[0];

                    const expectedPayload = JSON.parse(JSON.stringify(command));
                    delete expectedPayload.id;
                    delete expectedPayload.tenantId;
                    delete expectedPayload._correlationId;
                    delete expectedPayload._causationId;

                    return (
                        publishedCommands.length === 1 &&
                        serializedCommand.id === command.id.asString() &&
                        JSON.stringify(serializedCommand.payload) ===
                            JSON.stringify(expectedPayload) &&
                        serializedCommand.type === command.constructor.name &&
                        serializedCommand.tenantId === tenantId &&
                        serializedCommand.stream === command.correlationId.asString() &&
                        serializedCommand.correlationId === command.correlationId.asString() &&
                        serializedCommand.causationId === command.causationId.asString()
                    );
                },
            ]).shouldHaveBeenPassedTo(clientMock.publish);
        });
    });
});
