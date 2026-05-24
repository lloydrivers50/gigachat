import { Worker } from "bullmq";
import { emitDone, emitToken } from "../features/messages/messages.stream";
import { addMessage } from "../features/messages/messages.store";
import { connection } from "../queue/connection";
import { logger } from "../logger";

const log = logger.child({ proc: "worker" });

new Worker(
  "reply",
  async (job) => {
    const { id, text } = job.data;
    const reply = `Echo: "${text}"`;
    const tokens = reply.split(" ");
    log.info({ id, tokens: tokens.length }, "job received");

    for (const word of tokens) {
      emitToken(id, word);
      await sleep(120);
    }
    await addMessage({ id, role: "assistant", text: reply });
    emitDone(id);
    log.info({ id }, "job done");
  },
  { connection },
);

log.info("reply worker up, waiting for jobs");

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
