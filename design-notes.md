# gigachat — design notes (in progress)

A snapshot of the design conversation. Not a finished spec — picks up where we paused. Bedtime read.

---

## North star — what gigachat is

A corporate-travel chat assistant. User types a request in plain language; the system books real things via real APIs.

- **Domain**: cabs, trains, hotels, flights, transfers
- **Real bookings**, not fakes. Sandbox-first where possible, then real money
- **CTM-relevant** — connects to a real job context, not pure portfolio fluff

---

## Decisions reached so far

- **Async shape, not sync.** Client submits → message goes onto a command queue → backend worker picks it up → progress streams back to the FE over SSE. Browser never blocks.
- **Frontend**: chat UI, Tailwind for styling.
- **Agent observability**: LangSmith for traces.
- **Tools**: outbound email/PDF treated as another tool the agent can call.
- **Working pattern**: design first, code second. Lloyd articulates the system; Claude polishes, probes, and names. No scaffolding until the north star is real.

---

## The queue boundary

The "queue boundary" is a _decision_: which user requests go through the async queue vs which are handled inline on the HTTP request.

Three common ways to draw the line:

- **By duration** — anything > N seconds goes through the queue.
- **By tool type** — search/read tools stream back inline; action/write tools always queue.
- **By side-effect** — anything that touches money, books a thing, or sends email → queue with durable state. Pure searches → stream inline.

**Working assumption**: _by side-effect_. The queue is gigachat's **durability layer for risky operations**, not just infrastructure-for-its-own-sake.

---

## Failure-mode patterns — what happens when the browser dies

Four real cases, each needing different machinery:

**1. Close tab mid-conversation.** Persist every message + every agent response to the DB _before_ streaming. SSE going away doesn't matter — DB is the source of truth.

**2. Close tab mid-search.** Policy choice per tool: cancel the in-flight call, or let it finish and save the result. Decide explicitly. Senior rule of thumb: continue for cheap reads, cancel for expensive ones.

**3. Close tab mid-booking — the brutal one.** User hit "yes, book it" and _then_ crashed. Three patterns work together:

- **Idempotency keys** — every booking call carries a unique ID. Crash + retry = provider sees "I've handled that already, here's the existing booking." No double charge.
- **Outbox pattern** — _intent to book_ is written to a DB row in the same transaction as the user's confirmation. The worker reads the outbox. Crash between deciding and actually booking → on restart, the outbox row is still there. No intent is ever "in flight only in RAM."
- **Resumable agent state** — LangGraph checkpoints the agent's graph state after every step. Worker dies between step 4 and 5 → restart resumes at step 5, not from scratch.

**4. Multi-step, one step fails.** Flight books, hotel errors. The **saga pattern**: record what's been done, then either compensate (cancel the flight) or punt to the user ("flight booked, hotel failed — retry, or cancel the flight?").

### The four words worth owning

- **Durability** — state survives crashes
- **Idempotency** — same call twice, same result
- **Resumability** — work picks up where it left off
- **Compensation** — undo logic when a multi-step op half-fails

These are the senior-distributed-systems vocabulary for "the system doesn't fall over when something bad happens." The classic "double-booking" interview question is the cleanest miniature of all four.

---

## Where we paused

Open probe on the table:

> In gigachat, _who generates the idempotency key, and where does it live_?
>
> 1. The **client** (browser) when the user clicks "yes, book it".
> 2. The **agent** when it decides to call the booking tool.
> 3. The **outbox row's primary key** _is_ the idempotency key.
>
> One of these is the right answer for your design; the other two have specific problems.

Pick this up tomorrow.

---

## Still on the board

- **Scope of user requests** — single-tool ("book this train") vs multi-step itineraries ("plan and book my whole trip"). Shapes the agent's complexity downstream.
- **Memory / state design** — what does the bot remember between turns? Between sessions? Per-user preferences ("I always want aisle seats")?
- **Action/effect boundary** — explicit user confirmation step before any spending tool can fire. LangGraph human-in-the-loop interrupts.
- **Crash-handling depth** — handle properly vs demonstrate-the-pattern-only (with TODOs). Worth an ADR.
- **n8n** — what need does it actually answer? Pending.
- **Deployment target** — managed cloud (likely AWS EKS) vs Lloyd's VPS. Decide later.

---

## Working memory (already saved to Claude session)

Three memories load when you start a Claude Code session in `gigachat/`:

1. **Design first, code second** — for new work, design dialogue first. Lloyd articulates, Claude guides and polishes.
2. **gigachat is a mastery project** — depth, not reps. No early closeout.
3. **Socratic walkthrough** — when teaching existing code, point Lloyd at a file, let him articulate, then fill gaps.

Sleep well.

lloydivers@RTTH-LT-10843 ~/projects/gigachat (main)
$ claude
╭─── Claude Code v2.1.139 ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│ │ Tips for getting started │
│ Welcome back Lloyd! │ Run /init to create a CLAUDE.md file with instructions for Claude │
│ │ ────────────────────────────────────────────────────────────────────────────────────────────── │
│ ▐▛███▜▌ │ What's new │
│ ▝▜█████▛▘ │ Added agent view (Research Preview): a single list of every Claude Code session — running, bl… │
│ ▘▘ ▝▝ │ Added `/goal` command: set a completion condition and Claude keeps working across turns until… │
│ Opus 4.7 (1M context) · Claude Max · │ Added `/scroll-speed` command to tune mouse wheel scroll speed with a live preview │
│ lloydrivers50@gmail.com's Organization │ /release-notes for more │
│ ~/projects/gigachat │ │
╰─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯

❯ You should have some memories already as I asked the previous claude instance to goive you some, and I was working on this:

Read 1 file, listed 1 directory (ctrl+o to expand)

● Welcome back. I've got the context — three memories loaded (design-first, mastery project, Socratic walkthrough), and I've read design-notes.md.

We paused on this probe:

▎ In gigachat, who generates the idempotency key, and where does it live?
▎
▎ 1. The client (browser) when the user clicks "yes, book it"
▎ 2. The agent when it decides to call the booking tool
● Welcome back. I've got the context — three memories loaded (design-first, mastery project, Socratic walkthrough), and I've read design-notes.md.

We paused on this probe:

▎ In gigachat, who generates the idempotency key, and where does it live?
▎
▎ 1. The client (browser) when the user clicks "yes, book it"
▎ 2. The agent when it decides to call the booking tool
▎ 3. The outbox row's primary key is the idempotency key
▎
▎ One is right for your design; the other two have specific problems.

Where do you want to pick up — work that probe, or somewhere else on the board (scope of requests, memory/state, the n8n question)?

✻ Sautéed for 11s

※ recap: You're designing gigachat, a corporate-travel chat assistant with real bookings, and paused mid-design on the durability layer for risky operations. Next: decide who generates the
idempotency key — client, agent, or the outbox row's primary key. (disable recaps in /config)

❯ Can you first explain to me the reason for this key? WHat purpose it actually serves?

● Sure. The key isn't really about identity — it's about what to do when you don't know if your last call succeeded.

The actual problem

You're a client (your agent) calling someone else's booking API. You send POST /book with a flight payload. Then one of these happens:

- 200 OK comes back. Easy.
- Connection drops before you get a response. Now what?

That second case is the whole reason idempotency keys exist. You genuinely do not know whether the provider:

1. Never received the request → safe to retry.
2. Received it, started processing, crashed → maybe safe to retry.
3. Received it, booked the flight, charged the card, then the response got lost on the way back → retrying double-books the user.

You can't tell these apart from the client side. The network gave you silence.

What the key buys you

Every booking call carries a unique ID you generated. The provider stores "I've processed key abc-123, here's the result I returned." When you retry with the same key:

- If they've never seen it → they process it fresh.
- If they have → they replay the original result. No second booking. No second charge.

This turns a scary "I don't know if I should retry" into a boring "just retry until you get an answer." The key is what makes retrying safe.

The principle worth naming

Networks give you at-least-once delivery — you can always retry until something acks. Business operations need exactly-once semantics — you bill the card once, not three times. The
idempotency key is the bridge: at-least-once transport + dedup-on-key = effectively exactly-once side effect.

That's it. It's not about identifying the booking. It's about making retries safe when you can't trust the network to tell you what happened.

Does that frame the why clearly enough before we go back to the "who generates it" question?

✻ Crunched for 17s

❯ Is there any literature around this? Like a blog post I can read, or some system design newsletter?

● Yes, and there's actually a small canon on this. The single best starting point is Brandur Leach's Stripe blog post:

- "Designing robust and predictable APIs with idempotency" — stripe.com/blog/idempotency (2017). This is the industry-standard write-up. Brandur was a Stripe engineer; he explains the key,
  the storage model, TTLs, and what happens when two retries race. Read this first.

For a deeper, more implementation-oriented version of the same material:

- "Implementing Stripe-like Idempotency Keys in Postgres" on Brandur's personal blog at brandur.org. Walks through the actual DB schema and the locking dance. Pairs perfectly with the Stripe
  post.

For the broader principle (exactly-once, at-least-once, end-to-end argument):

- Designing Data-Intensive Applications by Martin Kleppmann, Ch. 11–12. The chapters on "Stream Processing" and "The Future of Data Systems" cover idempotency, dedup, and exactly-once
  semantics with the rigor of a textbook. If you only buy one system-design book, this is the one — and it'll keep paying off well beyond this question.

For the surrounding patterns you'll need next (outbox, saga, compensation):

- microservices.io by Chris Richardson. Plain reference site, but the Outbox, Saga, and Idempotent Receiver pattern pages are concise and well-cross-linked.

Newsletter-wise, The Pragmatic Engineer (Gergely Orosz) and ByteByteGo (Alex Xu) have both covered idempotency, but they're summarizing the Stripe post — go to the source.

Order I'd suggest: Stripe post tonight, Brandur's Postgres deep-dive when you're ready to think about how it lives in your DB, then DDIA Ch. 11 when you want the theory underneath all of it.

✻ Cogitated for 20s

※ recap: We're designing gigachat (corporate-travel chat assistant) and just covered why idempotency keys exist: making retries safe when the network hides whether a booking succeeded. Next:
answer who generates the key and where it lives. (disable recaps in /config)
