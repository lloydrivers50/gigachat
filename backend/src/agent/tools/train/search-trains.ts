import { tool } from "@langchain/core/tools";
import { searchTrainsSchema, type SearchTrainsInput } from "./schema";

// Stub: returns a few canned journeys so the agent loop has real-looking data to
// reason over. No real API, no side effects — swapped for a live rail API later.
async function searchTrains(input: SearchTrainsInput): Promise<string> {
  const { origin, destination, departureDate } = input;
  const options = [
    { depart: "08:15", arrive: "09:32", durationMin: 77, changes: 0, fareGBP: 42.5 },
    { depart: "09:42", arrive: "11:08", durationMin: 86, changes: 1, fareGBP: 31.0 },
    { depart: "11:05", arrive: "12:19", durationMin: 74, changes: 0, fareGBP: 58.0 },
  ];
  return JSON.stringify({ origin, destination, departureDate, options });
}

export const searchTrainsTool = tool(searchTrains, {
  name: "search_trains",
  description:
    "Search for available train journeys. Input: origin, destination, and departure date (YYYY-MM-DD). Returns a list of journey options (departure/arrival times, duration, changes, fare). Read-only — does not book anything.",
  schema: searchTrainsSchema,
});
