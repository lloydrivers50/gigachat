import { Worker } from "bullmq";
import { emitDone, emitToken } from "../features/messages/messages.stream";
import { addMessage } from "../features/messages/messages.store";
import { connection } from "../queue/connection";

new Worker(
  "reply",
  async (job) => {
    const { id, text } = job.data; // the {id, text} POST enqueued
    const reply = `Echo: "${text}"`;
    const tokens = reply.split(" ");
    console.log(`job received for ${id} — ${tokens.length} tokens`);

    // the old streamReply body, relocated — same emit calls, new process
    for (const word of tokens) {
      emitToken(id, word);
      await sleep(120);
    }
    addMessage({ id, role: "assistant", text: reply });
    emitDone(id);
    console.log(`job done for ${id}`);
  },
  { connection },
);

console.log("reply worker up, waiting for jobs");

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
