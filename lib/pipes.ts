import { ZodIssue } from "zod/v3";

export function upperCasePipe(value: unknown): string {
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  return String(value ?? "");
}

export async function validationPipe<T>(schema: any, body: unknown): Promise<T> {
  const result = schema.safeParse(body);

  if (!result.success) {
    const error = result.error.issues.map((e: ZodIssue) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return error;
  }

  return result.data;
}