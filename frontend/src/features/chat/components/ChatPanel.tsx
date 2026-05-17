import type { Message } from "../types";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { Composer } from "./Composer";

interface ChatPanelProps {
  messages: Message[];
  isTyping?: boolean;
  onSend: (text: string) => void;
}

/**
 * The whole chat feature, composed. It is purely presentational: it owns
 * no data. Messages, the typing flag and the send handler are all passed
 * in — that's deliberate, because the data and backend wiring is the part
 * being built separately.
 */
export function ChatPanel({ messages, isTyping, onSend }: ChatPanelProps) {
  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col bg-slate-100">
      <ChatHeader />
      <MessageList messages={messages} isTyping={isTyping} />
      <Composer onSend={onSend} />
    </div>
  );
}
