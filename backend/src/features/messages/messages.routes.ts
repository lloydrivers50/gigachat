import { Router } from "express";
import { addMessage, getMessages } from "./messages.store";
import type { Message } from "./messages.types";
import { emitToken, emitter, emitDone } from "./messages.stream";

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

  const responseText = `Echo: "${text}"`;
  const assistantMessage: Message = {
    id: crypto.randomUUID(),
    role: "assistant",
    text: responseText,
  };

  res.status(202).json({ id: assistantMessage.id });

  streamReply(assistantMessage);
});

function streamReply(message: Message) {
  const tokens = message.text.split(" ");

  const interval = setInterval(() => {
    if (tokens.length === 0) {
      addMessage(message);
      emitDone(message.id);
      clearInterval(interval);
      return;
    }
    emitToken(message.id, tokens.shift()!);
  }, 120);
}

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

  const tokenListener = ({ id, chunk }: { id: string; chunk: string }) => {
    res.write(`event: token\ndata: ${JSON.stringify({ id, chunk })}\n\n`);
  };

  emitter.on("token", tokenListener);

  const doneListener = ({ id }: { id: string }) => {
    res.write(`event: done\ndata: ${JSON.stringify({ id })}\n\n`);
  };

  emitter.on("done", doneListener);

  req.on("close", () => {
    emitter.off("token", tokenListener);
    emitter.off("done", doneListener);
  });
});
