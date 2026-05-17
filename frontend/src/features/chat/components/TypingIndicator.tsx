/**
 * Three bouncing dots. Right now it's a pure visual placeholder — later
 * this is where a real "agent is working" signal (the heartbeat from
 * design-notes.md) gets rendered.
 */
export function TypingIndicator() {
  return (
    <div className="flex gap-1 self-start rounded-2xl border border-slate-200 bg-white px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}
