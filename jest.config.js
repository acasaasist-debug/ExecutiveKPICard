module.exports = {
  preset: "ts-jest/presets/js-with-ts",
  testEnvironment: "jsdom",
  testMatch: ["**/*.spec.ts"],
  transformIgnorePatterns: [
    "node_modules/(?!powerbi-visuals-utils-formattingmodel|powerbi-visuals-utils-formattingutils|powerbi-visuals-utils-typeutils|powerbi-visuals-utils-tooltiputils)/"
  ],
  moduleNameMapper: {
    "\\.(css|less)$": "<rootDir>/test/__mocks__/styleMock.js"
  }
};
