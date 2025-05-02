const {
    resolveVariables,
    InvalidContextError,
    MissingVariableError,
    NullVariableError,
    ResolverError
} = require('../src/index'); // Import from index.js

describe('resolveVariables Function', () => {
  const context = {
    contact: {
      name: 'Alice Wonderland',
      id: 'c-123',
      address: { city: 'Fantasy Land', zip: null },
      preferences: ['email', 'sms'],
      details: { verified: true },
    },
    bot: {
      name: 'Cheshire Cat Bot',
      version: 1.2,
      config: null,
    },
    emptyString: '',
    zero: 0,
    falseVal: false,
  };

  // --- Basic Resolution ---
  test('should replace a single placeholder', () => {
    expect(resolveVariables('Hello {{ contact.name }}!', context)).toBe(
      'Hello Alice Wonderland!'
    );
  });

  test('should replace multiple placeholders', () => {
    expect(
      resolveVariables('User: {{ contact.name }}, Bot: {{ bot.name }}', context)
    ).toBe('User: Alice Wonderland, Bot: Cheshire Cat Bot');
  });

  test('should handle nested paths', () => {
    expect(resolveVariables('City: {{ contact.address.city }}', context)).toBe(
      'City: Fantasy Land'
    );
  });

  test('should handle placeholders with extra whitespace', () => {
    expect(resolveVariables('Hello {{  contact.name  }}!', context)).toBe(
      'Hello Alice Wonderland!'
    );
  });

  test('should handle text with no placeholders', () => {
    expect(resolveVariables('Plain text, no variables.', context)).toBe(
      'Plain text, no variables.'
    );
  });

  test('should return empty string for null or empty input text', () => {
    expect(resolveVariables(null, context)).toBe('');
    expect(resolveVariables(undefined, context)).toBe('');
    expect(resolveVariables('', context)).toBe('');
  });

  // --- Handling Different Value Types ---
  test('should convert numbers to strings', () => {
    expect(resolveVariables('Version: {{ bot.version }}', context)).toBe(
      'Version: 1.2'
    );
    expect(resolveVariables('Zero: {{ zero }}', context)).toBe('Zero: 0');
  });

  test('should convert booleans to strings', () => {
    expect(
      resolveVariables('Verified: {{ contact.details.verified }}', context)
    ).toBe('Verified: true');
    expect(resolveVariables('False: {{ falseVal }}', context)).toBe(
      'False: false'
    );
  });

  test('should handle empty strings as values', () => {
    expect(resolveVariables('Empty: "{{ emptyString }}"', context)).toBe(
      'Empty: ""'
    );
  });

  test('should stringify arrays by default', () => {
    expect(resolveVariables('Prefs: {{ contact.preferences }}', context)).toBe(
      'Prefs: ["email","sms"]'
    );
  });

  test('should stringify objects by default', () => {
    expect(resolveVariables('Details: {{ contact.details }}', context)).toBe(
      'Details: {"verified":true}'
    );
  });

  test('should not stringify objects/arrays if option is false', () => {
    const options = { stringifyObjects: false };
    // Note: Standard JS object to string conversion happens here
    expect(
      resolveVariables('Prefs: {{ contact.preferences }}', context, options)
    ).toMatch(/Prefs: email,sms|Prefs: \[object Object\]/); // Behavior can vary
    expect(
      resolveVariables('Details: {{ contact.details }}', context, options)
    ).toBe('Details: [object Object]');
  });

  // --- Handling Missing Variables (onMissing option) ---
  test('should return placeholder for missing variables by default', () => {
    expect(resolveVariables('Missing: {{ contact.lastName }}', context)).toBe(
      'Missing: {{ contact.lastName }}'
    );
  });

  test('should return empty string for missing variables when onMissing=emptyString', () => {
    const options = { onMissing: 'emptyString' };
    expect(
      resolveVariables('Missing: {{ contact.lastName }}', context, options)
    ).toBe('Missing: ');
  });

  test('should return "null" string for missing variables when onMissing=null', () => {
    const options = { onMissing: 'null' };
    expect(
      resolveVariables('Missing: {{ contact.lastName }}', context, options)
    ).toBe('Missing: null');
  });

  test('should throw MissingVariableError when onMissing=throw', () => {
    const options = { onMissing: 'throw' };
    expect(() =>
      resolveVariables('Missing: {{ contact.lastName }}', context, options)
    ).toThrow(MissingVariableError);
    expect(() =>
      resolveVariables('Missing: {{ contact.lastName }}', context, options)
    ).toThrow('Variable path not found in context: "contact.lastName"');
  });

  test('should use custom function for missing variables when onMissing=function', () => {
    const options = { onMissing: (path, ctx) => `[${path} not found]` };
    expect(
      resolveVariables('Missing: {{ contact.lastName }}', context, options)
    ).toBe('Missing: [contact.lastName not found]');
  });

  test('should handle error in custom onMissing function', () => {
    const options = {
      onMissing: (path, ctx) => {
        throw new Error('Custom handler failed');
      },
    };
    expect(() =>
      resolveVariables('Missing: {{ contact.lastName }}', context, options)
    ).toThrow(ResolverError); // Should wrap the custom error
    expect(() =>
      resolveVariables('Missing: {{ contact.lastName }}', context, options)
    ).toThrow('Resolution failed: Custom handler failed');
  });

  // --- Handling Null Variables (onNull option) ---
  test('should return "null" string for null variables by default (onNull=null)', () => {
    expect(resolveVariables('ZIP: {{ contact.address.zip }}', context)).toBe(
      'ZIP: null'
    );
    expect(resolveVariables('Bot Cfg: {{ bot.config }}', context)).toBe(
      'Bot Cfg: null'
    );
  });

  test('should return empty string for null variables when onNull=emptyString', () => {
    const options = { onNull: 'emptyString' };
    expect(
      resolveVariables('ZIP: {{ contact.address.zip }}', context, options)
    ).toBe('ZIP: ');
  });

  test('should return placeholder for null variables when onNull=placeholder', () => {
    const options = { onNull: 'placeholder' };
    expect(
      resolveVariables('ZIP: {{ contact.address.zip }}', context, options)
    ).toBe('ZIP: {{ contact.address.zip }}');
  });

  test('should throw NullVariableError when onNull=throw', () => {
    const options = { onNull: 'throw' };
    expect(() =>
      resolveVariables('ZIP: {{ contact.address.zip }}', context, options)
    ).toThrow(NullVariableError);
    expect(() =>
      resolveVariables('ZIP: {{ contact.address.zip }}', context, options)
    ).toThrow('Variable path resolved to null: "contact.address.zip"');
  });

  test('should use custom function for null variables when onNull=function', () => {
    const options = { onNull: (path, ctx) => `[Path ${path} is null]` };
    expect(
      resolveVariables('ZIP: {{ contact.address.zip }}', context, options)
    ).toBe('ZIP: [Path contact.address.zip is null]');
  });

  test('should handle error in custom onNull function', () => {
    const options = {
      onNull: (path, ctx) => {
        throw new Error('Custom null handler failed');
      },
    };
    expect(() =>
      resolveVariables('ZIP: {{ contact.address.zip }}', context, options)
    ).toThrow(ResolverError);
    expect(() =>
      resolveVariables('ZIP: {{ contact.address.zip }}', context, options)
    ).toThrow('Resolution failed: Custom null handler failed');
  });

  // --- Handling Invalid Context ---
  test('should throw InvalidContextError for null context', () => {
    expect(() => resolveVariables('Hello {{ name }}', null)).toThrow(
      InvalidContextError
    );
  });

  test('should throw InvalidContextError for non-object context', () => {
    expect(() => resolveVariables('Hello {{ name }}', 'string')).toThrow(
      InvalidContextError
    );
    expect(() => resolveVariables('Hello {{ name }}', 123)).toThrow(
      InvalidContextError
    );
    expect(() => resolveVariables('Hello {{ name }}', [])).toThrow(
      InvalidContextError
    ); // Arrays are objects, but maybe shouldn't be valid? Depends on spec. Current throws error.
    expect(() => resolveVariables('Hello {{ name }}', undefined)).toThrow(
      InvalidContextError
    );
  });
});
