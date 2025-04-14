import { z } from "zod";

// XML object schema definition
export const XmlSchema = z.object({
  name: z.string().optional(),
  namespace: z.string().optional(),
  prefix: z.string().optional(),
  attribute: z.boolean().optional(),
  wrapped: z.boolean().optional(),
});

export type Xml = z.infer<typeof XmlSchema>;
