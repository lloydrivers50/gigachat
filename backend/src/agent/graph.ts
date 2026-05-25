import {
  StateGraph,
  MessagesAnnotation,
  START,
  END,
} from "@langchain/langgraph";

import { ToolNode } from "@langchain/langgraph/prebuilt";

import { agentWithTools } from "./agent";

import { searchTrainsTool } from "./tools/train/search-trains";

async function agentNode(state: typeof MessagesAnnotation.State) {
  const response = await agentWithTools.invoke({
    history: state.messages,
  });
  return { messages: [response] };
}

const toolNode = new ToolNode([searchTrainsTool]);

function shouldUseTools(state: typeof MessagesAnnotation.State) {
  const last = state.messages.at(-1);
  if (last && "tool_calls" in last && (last as any).tool_calls?.length)
    return "tools";

  return END;
}

export const graph = new StateGraph(MessagesAnnotation)
  .addNode("agent", agentNode)
  .addNode("tools", toolNode)
  .addEdge(START, "agent")
  .addConditionalEdges("agent", shouldUseTools, {
    tools: "tools",
    [END]: END,
  })
  .addEdge("tools", "agent")
  .compile();
