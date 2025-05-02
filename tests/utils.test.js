const { getValueFromPath } = require('../src/utils');

describe('getValueFromPath Utility', () => {
  const testContext = {
    level1String: 'value1',
    level1Null: null,
    level1Object: {
      level2String: 'value2',
      level2Null: null,
      level2Object: {
        level3String: 'value3',
        'level3-with-hyphen': 'hyphen-value',
        'level3.with.dots': 'dots-value', // Testing keys with dots requires careful handling if needed
      },
      level2Undefined: undefined, // Property exists but is undefined
    },
    level1Array: ['item0', { key: 'item1Value' }, null],
    'top-level-hyphen': 'top-hyphen',
  };

  test('should retrieve top-level string property', () => {
    expect(getValueFromPath(testContext, 'level1String')).toBe('value1');
  });

  test('should retrieve top-level null property', () => {
    expect(getValueFromPath(testContext, 'level1Null')).toBeNull();
  });

  test('should retrieve top-level object property', () => {
    expect(getValueFromPath(testContext, 'level1Object')).toEqual(
      testContext.level1Object
    );
  });

  // --- Nested Cases ---
  test('should retrieve nested string property', () => {
    expect(getValueFromPath(testContext, 'level1Object.level2String')).toBe(
      'value2'
    );
  });

  test('should retrieve nested null property', () => {
    expect(getValueFromPath(testContext, 'level1Object.level2Null')).toBeNull();
  });

  test('should retrieve deeply nested string property', () => {
    expect(
      getValueFromPath(testContext, 'level1Object.level2Object.level3String')
    ).toBe('value3');
  });

  test('should retrieve properties with hyphens in key', () => {
    expect(
      getValueFromPath(
        testContext,
        'level1Object.level2Object.level3-with-hyphen'
      )
    ).toBe('hyphen-value');
    expect(getValueFromPath(testContext, 'top-level-hyphen')).toBe(
      'top-hyphen'
    );
  });

  // --- Array Access (Note: Standard dot notation doesn't usually access array indices) ---
  // getValueFromPath is designed for object paths. Accessing array indices directly
  // via dot notation (e.g., 'level1Array.0') won't work unless context is structured like { level1Array: { '0': ... } }
  // Testing the array itself:
  test('should retrieve top-level array property', () => {
    expect(getValueFromPath(testContext, 'level1Array')).toEqual(
      testContext.level1Array
    );
  });

  // If you specifically needed array index access, the function would need modification.
  // Example of modified context for testing index access:
  const contextWithArrayIndex = { arr: { 0: 'a', 1: 'b' } };
  test('should retrieve array index if context structured that way', () => {
    expect(getValueFromPath(contextWithArrayIndex, 'arr.0')).toBe('a');
    expect(getValueFromPath(contextWithArrayIndex, 'arr.1')).toBe('b');
    expect(getValueFromPath(contextWithArrayIndex, 'arr.2')).toBeUndefined();
  });

  // --- Missing/Invalid Path Cases ---
  test('should return undefined for non-existent top-level property', () => {
    expect(getValueFromPath(testContext, 'nonExistent')).toBeUndefined();
  });

  test('should return undefined for non-existent nested property', () => {
    expect(
      getValueFromPath(testContext, 'level1Object.nonExistent')
    ).toBeUndefined();
  });

  test('should return undefined for path going through non-object', () => {
    expect(
      getValueFromPath(testContext, 'level1String.subKey')
    ).toBeUndefined();
  });

  test('should return undefined for path going through null', () => {
    expect(getValueFromPath(testContext, 'level1Null.subKey')).toBeUndefined();
  });

  test('should return undefined for path ending in dot', () => {
    expect(getValueFromPath(testContext, 'level1Object.')).toBeUndefined();
  });

  test('should return undefined for empty path', () => {
    expect(getValueFromPath(testContext, '')).toBeUndefined();
  });

  test('should return undefined for path containing only dots', () => {
    expect(getValueFromPath(testContext, '.')).toBeUndefined();
    expect(getValueFromPath(testContext, '..')).toBeUndefined();
  });

  test('should return undefined for property that exists but holds undefined', () => {
    // Our function distinguishes between non-existent path (undefined) and existing property holding null (null).
    // It will also return undefined if the property exists but holds `undefined`.
    expect(
      getValueFromPath(testContext, 'level1Object.level2Undefined')
    ).toBeUndefined();
  });

  // --- Invalid Input Cases ---
  test('should return undefined for null context', () => {
    expect(getValueFromPath(null, 'level1String')).toBeUndefined();
  });

  test('should return undefined for undefined context', () => {
    expect(getValueFromPath(undefined, 'level1String')).toBeUndefined();
  });

  test('should return undefined for non-object context', () => {
    expect(getValueFromPath('string', 'level1String')).toBeUndefined();
    expect(getValueFromPath(123, 'level1String')).toBeUndefined();
    expect(getValueFromPath([], 'level1String')).toBeUndefined(); // Array is object, but maybe check isArrayLike? Current logic allows.
  });

  test('should return undefined for non-string path', () => {
    expect(getValueFromPath(testContext, null)).toBeUndefined();
    expect(getValueFromPath(testContext, undefined)).toBeUndefined();
    expect(getValueFromPath(testContext, 123)).toBeUndefined();
    expect(getValueFromPath(testContext, {})).toBeUndefined();
  });
});
