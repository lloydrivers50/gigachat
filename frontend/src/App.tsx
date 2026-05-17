import { ChatPanel } from "./features/chat";
import { useMessages } from "./hooks/useMessages";

export default function App() {
  const { messages, addMessage, isTyping } = useMessages();

  return (
    <ChatPanel messages={messages} isTyping={isTyping} onSend={addMessage} />
  );
}
