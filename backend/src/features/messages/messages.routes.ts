import { Router } from "express";
import { addMessage, getMessages } from "./messages.store";
import type { Message } from "./messages.types";
import { sub, CHANNEL } from "./messages.stream";
import { enqueueReply } from "../../queue/messages.queue";
import { logger } from "../../logger";

const log = logger.child({ proc: "web" });

export const messagesRouter = Router();

messagesRouter.post("/messages", async (req, res) => {
  const { text } = req.body;
  if (typeof text !== "string" || text.length === 0) {
    res.status(400).json({ error: "Invalid message format" });
    return;
  }

  const userMessage: Message = {
    id: crypto.randomUUID(),
    role: "user",
    text,
  };

  await addMessage(userMessage);

  const assistantId = crypto.randomUUID();
  res.status(202).json({ id: assistantId });

  enqueueReply(assistantId, text);
  log.info({ assistantId }, "reply enqueued");
});

messagesRouter.get("/messages", async (_req, res) => {
  const messages = await getMessages();
  res.json(messages);
});

messagesRouter.get("/messages/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  if (res.flushHeaders) {
    res.flushHeaders();
  }

  sub.subscribe(CHANNEL);
  log.info("SSE client connected");

  const onMessage = (_channel: string, message: string) => {
    const data = JSON.parse(message);
    if (data.type === "token") {
      res.write(
        `event: token\ndata: ${JSON.stringify({ id: data.id, chunk: data.chunk })}\n\n`,
      );
    } else if (data.type === "done") {
      res.write(`event: done\ndata: ${JSON.stringify({ id: data.id })}\n\n`);
    }
  };
  sub.on("message", onMessage);

  req.on("close", () => {
    sub.off("message", onMessage);
    log.info("SSE client disconnected");
  });
});
