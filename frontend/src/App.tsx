import { ChatPanel } from "./features/chat";
import { useMessages } from "./hooks/useMessages";

export default function App() {
  const { messages, addMessage } = useMessages();

  return <ChatPanel messages={messages} isTyping={false} onSend={addMessage} />;
}
