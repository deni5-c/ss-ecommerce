export function upperCasePipe(value: unknown): string {
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  return String(value ?? "");
}