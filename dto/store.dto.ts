import { z } from "zod";

export const CreateStoreSchema = z.object({
  name: z.string()
    .min(3, "Name must be at least 3 characters long")
    .max(50, "Name must be less than 50 characters"),
  address: z.string()
    .min(10, "Address must be at least 10 characters long")
    .max(100, "Address must be less than 100 characters"),
});

export type CreateStoreDTO = z.infer<typeof CreateStoreSchema>;
