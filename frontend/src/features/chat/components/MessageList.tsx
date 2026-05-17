import { useEffect, useRef } from "react";
import type { Message } from "../types";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";

interface MessageListProps {
  messages: Message[];
  isTyping?: boolean;
}

/** The scrolling list of bubbles. Keeps the newest message in view. */
export function MessageList({ messages, isTyping = false }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const isEmpty = messages.length === 0 && !isTyping;

  return (
    <main className="flex flex-1 flex-col gap-3 overflow-y-auto p-5">
      {isEmpty ? (
        <p className="m-auto max-w-sm text-center text-sm text-slate-400">
          Ask for a cab, a train, a hotel, or a flight. Plain language is fine.
        </p>
      ) : (
        messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))
      )}
      {isTyping && <TypingIndicator />}
      <div ref={bottomRef} />
    </main>
  );
}
