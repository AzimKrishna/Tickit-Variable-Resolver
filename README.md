# Variable Resolver

[![NPM Version](https://img.shields.io/npm/v/variable-resolver.svg)](https://www.npmjs.com/package/variable-resolver)
[![Build Status](https://img.shields.io/github/actions/workflow/status/AzimKrishna/Tickit-Variable-Resolver/ci.yml?branch=main)](https://github.com/AzimKrishna/Tickit-Variable-Resolver/actions)
[![Coverage Status](https://img.shields.io/coveralls/github/AzimKrishna/Tickit-Variable-Resolver/main.svg)](https://coveralls.io/github/AzimKrishna/Tickit-Variable-Resolver?branch=main)
[![License](https://img.shields.io/npm/l/variable-resolver.svg)](LICENSE)

A robust Node.js library for resolving `{{placeholder.path}}` style variables within strings using a provided data context object. It includes utilities for safely accessing nested data and offers flexible options for handling missing or null values.

Originally developed for internal use, now made public for general utility.

## Features

*   Resolves simple and nested variables using dot notation (e.g., `{{ user.name }}`, `{{ user.address.city }}`).
*   Safely handles accessing nested properties, returning `undefined` if any part of the path doesn't exist.
*   Distinguishes between a path resolving to `null` and a path not being found (`undefined`).
*   Configurable options for handling missing or null values:
    *   Return the original placeholder (default).
    *   Return an empty string.
    *   Return the string `"null"`.
    *   Throw specific error types (`MissingVariableError`, `NullVariableError`).
    *   Execute a custom handler function.
*   Optionally stringifies resolved objects and arrays using `JSON.stringify`.
*   Includes custom error types for better error handling.
*   Provides a standalone utility function `getValueFromPath` for safe nested data access.

## Installation

```bash
npm install variable-resolver
# or
yarn add variable-resolver
```

## Usage

### `resolveVariables(text, context, [options])`

This is the main function for replacing placeholders in a string.

```javascript
const {
    resolveVariables,
    InvalidContextError,
    MissingVariableError,
    NullVariableError
} = require('variable-resolver'); // Use package name after publishing

const template = "Welcome, {{ user.name }}! Your city: {{ user.address.city }}. Your zip: {{ user.address.zip }}. Missing: {{ user.missing }}.";

const dataContext = {
  user: {
    name: 'Alice',
    address: {
      city: 'Wonderland',
      zip: null // Explicit null value
    }
  }
};

// --- Default Behavior ---
// Missing variables -> placeholder
// Null variables -> 'null' string
const resolvedDefault = resolveVariables(template, dataContext);
// Result: "Welcome, Alice! Your city: Wonderland. Your zip: null. Missing: {{ user.missing }}."
console.log(resolvedDefault);

// --- Custom Options ---
const options = {
  onMissing: 'emptyString', // Return '' for missing variables
  onNull: '[Not Set]',      // Return custom string for null variables
  stringifyObjects: false   // Avoid stringifying objects/arrays (use with caution)
};
const resolvedWithOptions = resolveVariables(template, dataContext, options);
// Result: "Welcome, Alice! Your city: Wonderland. Your zip: [Not Set]. Missing: ."
console.log(resolvedWithOptions);

// --- Throwing Errors ---
const optionsThrow = {
  onMissing: 'throw',
  onNull: 'throw'
};
try {
  resolveVariables(template, dataContext, optionsThrow);
} catch (e) {
  if (e instanceof MissingVariableError) {
    console.error(`Error: Missing variable path "${e.path}"`);
  } else if (e instanceof NullVariableError) {
    console.error(`Error: Variable path "${e.path}" resolved to null`);
  } else if (e instanceof InvalidContextError) {
    console.error(`Error: ${e.message}`);
  } else {
    console.error("An unexpected error occurred:", e);
  }
  // Example Output (for missing): Error: Missing variable path "user.missing"
  // Example Output (for null): Error: Variable path "user.address.zip" resolved to null
}

// --- Custom Handler Functions ---
const optionsFunc = {
    onMissing: (path, context) => `[${path.toUpperCase()} Needed]`,
    onNull: (path, context) => `(N/A)`
};
const resolvedFunc = resolveVariables(template, dataContext, optionsFunc);
// Result: "Welcome, Alice! Your city: Wonderland. Your zip: (N/A). Missing: [USER.MISSING Needed]."
console.log(resolvedFunc);

```

### `getValueFromPath(obj, path)`

A utility function to safely retrieve values from nested objects using dot notation.

```javascript
const { getValueFromPath } = require('variable-resolver');

const data = { a: { b: { c: 123, d: null } } };

console.log(getValueFromPath(data, 'a.b.c')); // Output: 123
console.log(getValueFromPath(data, 'a.b.d')); // Output: null
console.log(getValueFromPath(data, 'a.b.e')); // Output: undefined
console.log(getValueFromPath(data, 'a.x.y')); // Output: undefined
console.log(getValueFromPath(null, 'a.b'));   // Output: undefined
console.log(getValueFromPath(data, ''));      // Output: undefined
```

## API Reference

### `resolveVariables(text, context, [options])`

*   **`text`**: `String | null | undefined` - The input string with `{{path.to.value}}` placeholders.
*   **`context`**: `Object` - The data object for variable lookups. Must be a non-null, non-array object.
*   **`options`**: `Object` (optional) - Configuration settings:
    *   `onMissing`: `String | Function` (default: `'placeholder'`)
        *   How to handle paths *not found* in the context.
        *   Values: `'placeholder'`, `'emptyString'`, `'null'` (string), `'throw'`, `Function(path, context) => String`.
    *   `onNull`: `String | Function` (default: `'null'`)
        *   How to handle paths that *resolve to `null`*.
        *   Values: `'null'` (string), `'emptyString'`, `'placeholder'`, `'throw'`, `Function(path, context) => String`.
    *   `stringifyObjects`: `Boolean` (default: `true`)
        *   If `true`, objects/arrays found at a path are converted using `JSON.stringify`.
        *   If `false`, standard JavaScript object-to-string conversion occurs (e.g., `[object Object]`).

*   **Returns:** `String` - The resolved string.
*   **Throws:**
    *   `InvalidContextError`: If `context` is not a valid object (or is an array).
    *   `MissingVariableError`: If `options.onMissing` is `'throw'` and a path is not found. Access the path via `error.path`.
    *   `NullVariableError`: If `options.onNull` is `'throw'` and a path resolves to `null`. Access the path via `error.path`.
    *   `ResolverError`: For errors within custom handlers or other unexpected issues during resolution.

### `getValueFromPath(obj, path)`

*   **`obj`**: `Object | null | undefined` - The object to search within.
*   **`path`**: `String` - The dot-notation path.
*   **Returns:** `any | undefined` - The value found, `null` if the value is explicitly null, or `undefined` if the path is invalid or doesn't exist.

## License

ISC - Please see the [LICENSE](LICENSE) file for details (You need to create a LICENSE file, e.g., containing the standard ISC license text).
