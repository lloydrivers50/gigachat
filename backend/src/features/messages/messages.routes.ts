import { Router } from "express";
import { addMessage, getMessages } from "./messages.store";
import type { Message } from "./messages.types";
import { sub, CHANNEL } from "./messages.stream";
import { enqueueReply } from "../../queue/messages.queue";

export const messagesRouter = Router();

messagesRouter.post("/messages", (req, res) => {
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

  addMessage(userMessage);

  const assistantId = crypto.randomUUID();
  res.status(202).json({ id: assistantId });

  enqueueReply(assistantId, text);
  console.log(`enqueued reply ${assistantId}`);
});

messagesRouter.get("/messages", (_req, res) => {
  const messages = getMessages();
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
  console.log("SSE client connected");

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
    console.log("SSE client disconnected");
  });
});
