import { ZodSchema } from "zod";

export async function validationPipe<T>(schema: ZodSchema, data: unknown): Promise<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = result.error.issues.map(e => e.message).join(", ");
    throw new Error(message);
  }
  return result.data as T;
}

export function upperCasePipe(value: unknown): string {
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  return String(value ?? "");
}


