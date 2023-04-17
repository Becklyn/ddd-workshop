import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
    moduleFileExtensions: ["js", "json", "ts"],
    rootDir: "src",
    testRegex: ".*\\.spec\\.ts$",
    transform: {
        "^.+\\.(t|j)s$": "ts-jest",
    },
    collectCoverageFrom: ["**/*.(t|j)s"],
    coverageDirectory: "../coverage",
    testEnvironment: "node",
    moduleNameMapper: {
        "@EventOrganizing/(.*)$": ["<rootDir>/EventOrganizing/$1"],
        "@Shopping/(.*)$": ["<rootDir>/Shopping/$1"],
    },
};
export default config;
