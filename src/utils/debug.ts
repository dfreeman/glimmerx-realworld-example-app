export function assert(condition: unknown, message = 'Oops!'): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}
