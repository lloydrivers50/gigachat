import { Router } from "express";
import { addMessage } from "./messages.store";
import type { Message } from "./messages.types";

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

  const assistantMessage: Message = {
    id: crypto.randomUUID(),
    role: "assistant",
    text: `Echo: "${text}"`,
  };

  addMessage(userMessage);
  addMessage(assistantMessage);
  res.status(201).json(assistantMessage);
});
