const resolver = require('./resolver');
const utils = require('./utils');
const errors = require('./errors');

module.exports = {
  ...resolver, // Spreads resolveVariables and the errors exported from resolver.js
  ...utils, // Spreads getValueFromPath if exported from utils
  ...errors, // Spreads all error classes if needed directly
};
