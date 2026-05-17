import { useState, type FormEvent } from "react";

interface ComposerProps {
  /** Called with the trimmed message text when the user sends. */
  onSend: (text: string) => void;
}

/**
 * The input bar. Owns only its own draft text — what *happens* to a sent
 * message is the parent's job, handed in via `onSend`.
 */
export function Composer({ onSend }: ComposerProps) {
  const [text, setText] = useState("");

  function updateText(nextText: string) {
    setText(nextText);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    updateText("");
  }

  return (
    <footer className="border-t border-slate-200 bg-white p-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(event) => updateText(event.target.value)}
          autoComplete="off"
          placeholder="Book me a train to Manchester tomorrow morning…"
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </footer>
  );
}
