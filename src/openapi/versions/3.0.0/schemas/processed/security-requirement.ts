import { z } from "zod";

// SecurityRequirement object schema definition
// Key is security scheme name, value is list of scopes
export const SecurityRequirementSchema = z.record(z.array(z.string()));

export type SecurityRequirement = z.infer<typeof SecurityRequirementSchema>;
