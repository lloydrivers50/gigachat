import { useState, useEffect } from "react";
import type { Message } from "../features/chat";
import { getMessages, postMessage } from "../features/chat/api";

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  async function addMessage(text: string) {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text,
    };
    setMessages((prev) => [...prev, userMessage]);

    setIsTyping(true);
    try {
      const { id } = await postMessage(text);
      setMessages((prev) => [
        ...prev,
        { id, role: "assistant", text: "", streaming: true },
      ]);
    } catch (error) {
      setIsTyping(false);
      console.error("Failed to send message:", error);
    }
  }

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

  useEffect(() => {
    if (typeof EventSource === "undefined") {
      console.warn(
        "EventSource is not supported in this environment. Real-time updates will not work.",
      );
      return;
    }

    const eventSource = new EventSource("/messages/stream");
    eventSource.addEventListener("token", (event) => {
      if (!event.data) return;
      try {
        const { id, chunk } = JSON.parse(event.data);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === id
              ? { ...msg, text: msg.text + chunk, streaming: true }
              : msg,
          ),
        );
      } catch (error) {
        console.error("Failed to parse SSE data:", error);
      }
    });
    eventSource.onerror = () => {
      console.error("An error occurred with the EventSource connection.");
    };
    eventSource.addEventListener("done", (event) => {
      if (!event.data) return;
      try {
        const { id } = JSON.parse(event.data);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === id ? { ...msg, streaming: false } : msg,
          ),
        );
        setIsTyping(false);
      } catch (error) {
        setIsTyping(false);
        console.error("Failed to parse SSE data:", error);
      }
    });
    return () => {
      eventSource.close();
    };
  }, []);

  return { messages, addMessage, isTyping };
}
