import { Worker } from "bullmq";
import { emitDone, emitToken } from "../features/messages/messages.stream";
import { addMessage, getMessages } from "../features/messages/messages.store";
import { connection } from "../queue/connection";
import { logger } from "../logger";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { graph } from "../agent/graph";

const log = logger.child({ proc: "worker" });

const worker = new Worker(
  "reply",
  async (job) => {
    const { id } = job.data;
    log.info({ id }, "job received");

    const history = await getMessages();
    log.debug({ id, turns: history.length }, "history loaded");

    const messages = history.map((m) =>
      m.role === "user" ? new HumanMessage(m.text) : new AIMessage(m.text),
    );

    let full = "";

    const stream = await graph.stream({ messages }, { streamMode: "messages" });
    for await (const [chunk, meta] of stream) {
      if (meta.langgraph_node !== "agent") continue;

      full += chunk.text;
      if (chunk.text) emitToken(id, chunk.text);
    }

    log.info({ id, chars: full.length }, "reply generated");
    await addMessage({ id, role: "assistant", text: full });
    emitDone(id);
    log.info({ id }, "job done");
  },
  { connection },
);

// A thrown processor = a failed job (BullMQ will retry). Log it, or it vanishes silently.
worker.on("failed", (job, err) => {
  log.error({ id: job?.data?.id, err }, "job failed");
});

log.info("reply worker up, waiting for jobs");
