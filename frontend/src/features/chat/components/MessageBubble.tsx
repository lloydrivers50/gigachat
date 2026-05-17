import type { Message } from "../types";

/** A single chat bubble. User messages sit right, assistant messages left. */
export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div
      className={
        "max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm " +
        (isUser
          ? "self-end bg-indigo-600 text-white"
          : "self-start border border-slate-200 bg-white text-slate-800")
      }
    >
      {message.text}
    </div>
  );
}
