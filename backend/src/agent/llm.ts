import { ChatAnthropic } from "@langchain/anthropic";

export const model = new ChatAnthropic({
  model: "claude-sonnet-4-6",
  temperature: 0.2,
  maxTokens: 1024,
  apiKey: process.env.ANTHROPIC_API_KEY,
});
