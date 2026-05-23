/**
 * The chat's view model — deliberately minimal, just what a bubble needs
 * to render. The richer event/lifecycle model from design-notes.md
 * (accepted → working → needs-you → done) is yours to design; this is
 * only the shape the UI draws.
 */
export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  streaming?: boolean;
}
