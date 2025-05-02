function getValueFromPath(obj, path) {
  if (
    !obj ||
    typeof obj !== 'object' ||
    typeof path !== 'string' ||
    path === ''
  ) {
    return undefined;
  }

  const parts = path.split('.');
  let current = obj;

  for (const part of parts) {
    if (
      current === null ||
      typeof current !== 'object' ||
      !Object.prototype.hasOwnProperty.call(current, part)
    ) {
      return undefined;
    }

    current = current[part];
  }

  return current;
}

module.exports = {
  getValueFromPath,
};
