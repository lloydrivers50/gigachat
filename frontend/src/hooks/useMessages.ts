import { useState, useEffect } from "react";
import type { Message } from "../features/chat";
import { getMessages, postMessage } from "../features/chat/api";

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

  // An effect callback can't be async, so the fetch runs in an inner function.
  useEffect(() => {
    async function loadHistory() {
      try {
        const history = await getMessages();
        setMessages(history);
      } catch (error) {
        console.error("Failed to load messages:", error);
      }
    }
    loadHistory();
  }, []);

  return { messages, addMessage, isTyping };
}
