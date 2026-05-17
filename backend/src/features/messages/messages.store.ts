import type { Message } from "./messages.types";
const messages: Message[] = []; // <- sits at the TOP of the file

export function addMessage(message: Message) {
  messages.push(message);
  return message;
}
export function getMessages(): Message[] {
  return messages;
}
