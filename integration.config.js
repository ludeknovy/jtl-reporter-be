module.exports = {
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js",
  ],
  preset: "ts-jest",
  testMatch: [
    "**/src/tests/integration/**/*.spec.ts",
  ],
  verbose: true,
  setupFilesAfterEnv: ["<rootDir>/src/tests/integration/helper/setup.ts"],
  reporters: ["default"],
}
