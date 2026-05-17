import { useState } from "react";
import type { Message } from "../features/chat";

/**
 * Owns the conversation as live state. Today it only knows how to append a
 * user message; later, the SSE handler will append assistant messages into
 * the same array (see design-notes.md).
 */
export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);

  function addMessage(text: string) {
    const newMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text,
    };
    setMessages((prev) => [...prev, newMessage]);
  }

  return { messages, addMessage };
}
