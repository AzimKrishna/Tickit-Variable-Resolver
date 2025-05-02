const globals = require('globals');
const jestPlugin = require('eslint-plugin-jest');

module.exports = [
    {
        // Global configuration for all JS files
        files: ["src/**/*.js", "tests/**/*.js"],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'commonjs', // Change to 'module' if using ES Modules
            globals: {
                ...globals.node, // Add Node.js globals
            },
        },
        rules: {
            // --- ESLint Recommended Rules ---
            // (ESLint v9+ includes these by default usually, but you can be explicit)
            // Example: 'no-unused-vars': 'warn', 'eqeqeq': 'error', etc.
            'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
            'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
            'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
            'eqeqeq': ['error', 'always'],
            'curly': ['error', 'all'],
        },
    },
    {
        // Configuration specifically for test files
        files: ["tests/**/*.js", "**/*.test.js", "**/*.spec.js"],
        plugins: {
            jest: jestPlugin,
        },
        rules: {
            ...jestPlugin.configs.recommended.rules, // Apply Jest recommended rules
            // Override or add specific Jest rules
            'jest/no-disabled-tests': 'warn',
            'jest/no-focused-tests': 'error',
            'jest/no-identical-title': 'error',
            'jest/prefer-to-have-length': 'warn',
            'jest/valid-expect': 'error',
        },
        languageOptions: {
            globals: {
                ...globals.jest, // Add Jest globals
            }
        }
    },
    // Add Prettier configuration if needed (usually via eslint-config-prettier)
    // This part requires checking the latest way to integrate prettier with flat config
    // Often involves importing the config and spreading it.
    // Example (might need adjustment):
    // require('eslint-config-prettier')
];