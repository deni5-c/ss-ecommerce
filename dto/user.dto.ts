import { z } from "zod";

export const RegisterUserSchema = z.object({
  name: z.string()
    .min(3, "Name must be at least 3 characters long")
    .max(50, "Name must be less than 50 characters"),
  email: z.string()
    .email("Invalid email format"),
  password: z.string()
    .min(6, "Password must be at least 6 characters long")
    .max(50, "Password too long"),
  role: z.enum(["USER", "ADMIN"]).optional(),
});

export const LoginUserSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export type RegisterUserDTO = z.infer<typeof RegisterUserSchema>;
export type LoginUserDTO = z.infer<typeof LoginUserSchema>;
