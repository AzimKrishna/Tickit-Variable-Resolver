class ResolveError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}

class InvalidContextError extends ResolveError {
  constructor() {
    super('Invalid context provided. Context must be a non-null object.');
  }
}

class MissingVariableError extends ResolveError {
  constructor(path) {
    super(`Variable path not found in context ${path}`);
    this.path = path;
  }
}

class NullVariableError extends ResolveError {
  constructor(path) {
    super(`Variable resolved to null: ${path}`);
    this.path = path;
  }
}

module.exports = {
  ResolveError,
  InvalidContextError,
  MissingVariableError,
  NullVariableError,
};
