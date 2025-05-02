const { getValueFromPath } = require('./utils');
const {
  InvalidContextError,
  MissingVariableError,
  NullVariableError,
  ResolveError,
} = require('./errors');

const DEFAULT_OPTIONS = {
  onMissing: 'placeholder',
  onNull: 'null',
  stringifyObjects: true,
};

const PLACEHOLDER_REGEX = /\{\{\s*([\w.-]+)\s*\}\}/g;

function resolveVariables(text, context, options = {}) {
  if (typeof text !== 'string' || text === '') {
    return '';
  }

  if (!context || typeof context !== 'object' || Array.isArray(context)) {
    throw new InvalidContextError();
  }

  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  try {
    // START OF TRY BLOCK
    return text.replace(PLACEHOLDER_REGEX, (match, path) => {
      const trimmedPath = path.trim();
      const value = getValueFromPath(context, trimmedPath);

      // Case 1: Path not found
      if (value === undefined) {
        switch (mergedOptions.onMissing) {
          case 'emptyString':
            return '';
          case 'null':
            return 'null';
          case 'throw':
            throw new MissingVariableError(trimmedPath);
          case 'placeholder':
            return match;
          default:
            if (typeof mergedOptions.onMissing === 'function') {
              // Ensure the function is called and its result is stringified
              try {
                return String(mergedOptions.onMissing(trimmedPath, context));
              } catch (funcError) {
                console.error(
                  `@tickit/variable-resolver: Error in custom onMissing handler for path '${trimmedPath}':`,
                  funcError
                );
                throw new ResolveError(
                  `Resolution failed: Error in custom onMissing handler - ${funcError.message}`
                ); // Wrap custom handler error
              }
            }
            return match; // Fallback to placeholder if handler is invalid type
        }
      }

      // Case 2: Path found, value is null
      if (value === null) {
        switch (mergedOptions.onNull) {
          case 'emptyString':
            return '';
          case 'placeholder':
            return match;
          case 'throw':
            throw new NullVariableError(trimmedPath);
          case 'null':
            return 'null'; // Default
          default:
            if (typeof mergedOptions.onNull === 'function') {
              // Ensure the function is called and its result is stringified
              try {
                return String(mergedOptions.onNull(trimmedPath, context));
              } catch (funcError) {
                console.error(
                  `@tickit/variable-resolver: Error in custom onNull handler for path '${trimmedPath}':`,
                  funcError
                );
                throw new ResolveError(
                  `Resolution failed: Error in custom onNull handler - ${funcError.message}`
                ); // Wrap custom handler error
              }
            }
            return 'null'; // Fallback to default 'null' string
        }
      }
      // Case 3: Path found, value is object/array
      if (typeof value === 'object' && mergedOptions.stringifyObjects) {
        try {
          return JSON.stringify(value);
        } catch (stringifyError) {
          console.warn(
            `@tickit/variable-resolver: Failed to stringify object/array for path '${trimmedPath}'. Returning placeholder.`,
            stringifyError
          );
          return match;
        }
      }
      // Case 4: Path found, value is primitive
      return String(value);
    });
    // END OF TRY BLOCK CONTENTS
  } catch (error) {
    // <--- Ensure this variable is named 'error'
    // Re-throw known resolver errors
    if (error instanceof ResolveError) {
      // <--- Check against the variable 'error'
      throw error;
    }
    // Wrap other unexpected errors
    console.error(
      `@tickit/variable-resolver: Unexpected error during replacement:`,
      error // Log the actual caught error
    );
    // Corrected template literal usage
    throw new ResolveError(`Resolution failed: ${error.message}`);
  }
}

module.exports = {
  resolveVariables,
  InvalidContextError,
  MissingVariableError,
  NullVariableError,
  ResolveError,
};
