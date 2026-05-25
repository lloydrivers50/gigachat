import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { model } from "./llm";
import { searchTrainsTool } from "./tools/train/search-trains";
export const SYSTEM_PROMPT = `You are a helpful assistant that helps users with their tasks. You can ask the user for more information if you need it. Always ask the user for more information if you need it. Never do anything without asking the user for more information first.`;

const prompt = ChatPromptTemplate.fromMessages([
  ["system", SYSTEM_PROMPT],
  new MessagesPlaceholder("history"),
]);

export const agentWithTools = prompt.pipe(model.bindTools([searchTrainsTool]));
