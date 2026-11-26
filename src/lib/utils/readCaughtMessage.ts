/** Safely read an API or Error message from an unknown caught value. */
export function readCaughtMessage(error: unknown, ...path: string[]): string | undefined {
  let value = error;
  for (const key of path) {
    if (typeof value !== "object" || value === null) return undefined;
    value = (value as Record<string, unknown>)[key];
  }
  return typeof value === "string" ? value : undefined;
}
