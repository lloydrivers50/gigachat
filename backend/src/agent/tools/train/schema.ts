import { z } from "zod";

export const searchTrainsSchema = z.object({
  origin: z
    .string()
    .min(1)
    .describe("The city or station where the train journey starts."),
  destination: z
    .string()
    .min(1)
    .describe("The city or station where the train journey ends."),
  departureDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .describe("The date to search for departures on (YYYY-MM-DD)."),
});

export type SearchTrainsInput = z.infer<typeof searchTrainsSchema>;
