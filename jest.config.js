/** @type {import('jest').Config} */
const config = {
    // Automatically clear mock calls, instances, contexts and results before every test
    clearMocks: true,

    // Indicates whether the coverage information should be collected while executing the test
    collectCoverage: true,

    // The directory where Jest should output its coverage files
    coverageDirectory: "coverage",

    // An array of glob patterns indicating a set of files for which coverage information should be collected
    collectCoverageFrom: ['src/**/*.js'], // Adjust if you have different file extensions or structure

    // The coverage reporter(s) to use. Supports 'text', 'lcov', 'clover', etc.
    coverageReporters: ["text", "lcov", "clover"],

    // A list of paths to directories that Jest should use to search for files in
    roots: ["<rootDir>/tests"],

    // The test environment that will be used for testing (node is standard for backend libraries)
    testEnvironment: "node",

    // The glob patterns Jest uses to detect test files
    testMatch: [
        "**/__tests__/**/*.[jt]s?(x)", // Standard Jest patterns
        "**/?(*.)+(spec|test).[tj]s?(x)"
    ],

    // Indicates whether each individual test should be reported during the run
    verbose: true,

    // Code coverage thresholds (optional, but recommended)
    // coverageThreshold: {
    //   global: {
    //     branches: 80,
    //     functions: 85,
    //     lines: 85,
    //     statements: 85,
    //   },
    // },

    // Module file extensions for importing
    moduleFileExtensions: ['js', 'json', 'node'],

    // Transform files before running tests (useful for Babel/TypeScript, but not strictly needed for basic CommonJS)
    // transform: {},
};

module.exports = config;