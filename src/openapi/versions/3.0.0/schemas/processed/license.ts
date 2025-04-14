import { z } from "zod";

// License object schema definition
export const LicenseSchema = z.object({
  name: z.string(),
  url: z.string().url().optional(),
});

export type License = z.infer<typeof LicenseSchema>;
