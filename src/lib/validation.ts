import { z } from "zod";

export const eventsQuerySchema = z.object({
  city: z.string().min(1).max(100),
  category: z.string().min(1).max(100).optional(),
  cursor: z.string().min(1).max(100).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  q: z.string().min(1).max(200).optional(),
  free: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  when: z.enum(["today", "tomorrow", "weekend", "week"]).optional(),
});

export type EventsQuery = z.infer<typeof eventsQuerySchema>;

export const priceTypeSchema = z.enum(["FREE", "PAID", "RANGE", "UNKNOWN"]);
