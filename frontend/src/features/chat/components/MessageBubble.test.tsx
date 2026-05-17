import { render, screen } from "@testing-library/react";
import { MessageBubble } from "./MessageBubble";

// A small sample test, mostly to prove the Vitest + Testing Library setup
// works. Copy the pattern for the components you build out.
describe("MessageBubble", () => {
  it("renders the message text", () => {
    render(
      <MessageBubble message={{ id: "1", role: "user", text: "hello" }} />,
    );
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("aligns a user message to the right", () => {
    render(<MessageBubble message={{ id: "1", role: "user", text: "hi" }} />);
    expect(screen.getByText("hi")).toHaveClass("self-end");
  });

  it("aligns an assistant message to the left", () => {
    render(
      <MessageBubble message={{ id: "2", role: "assistant", text: "hi" }} />,
    );
    expect(screen.getByText("hi")).toHaveClass("self-start");
  });
});
