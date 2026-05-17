import { useState } from "react";
import type { Message } from "../features/chat";
import { postMessage } from "../features/chat/api";

/**
 * Owns the conversation as live state. Today it only knows how to append a
 * user message; later, the SSE handler will append assistant messages into
 * the same array (see design-notes.md).
 */
export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  async function addMessage(text: string) {
    const newMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text,
    };
    setMessages((prev) => [...prev, newMessage]);

    setIsTyping(true);
    try {
      const reply = await postMessage(text);
      setMessages((prev) => [...prev, reply]);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsTyping(false);
    }
  }

  return { messages, addMessage, isTyping };
}
