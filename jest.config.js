module.exports = {
  preset: "ts-jest",
  setupFilesAfterEnv: ["<rootDir>/setupTests.js"],
  testEnvironment: "node",
  testRegex: ".*\\.spec\\.ts?$",
};
