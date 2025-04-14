import { z } from "zod";

// Discriminator object schema definition
export const DiscriminatorSchema = z.object({
  propertyName: z.string(),
  mapping: z.record(z.string(), z.string()).optional(),
});

export type Discriminator = z.infer<typeof DiscriminatorSchema>;
