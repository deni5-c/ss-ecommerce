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

export function validateCsvFile(file: File) {
  if (!file) throw new Error("No file uploaded.");

  if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
    throw new Error("Invalid file type. Only CSV is allowed.");
  }

  if (file.size > 2 * 1024 * 1024) {
    throw new Error("File too large. Max 2MB.");
  }

  return true;
}



