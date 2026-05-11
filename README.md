# gigachat

A chat app, deliberately over-engineered.

The product is the pretext. The actual goal is to touch every layer of a production cloud-native + AI stack at least once, on purpose. When the voice in your head says *"you don't need that yet"* — in this repo, that voice is wrong.

## What gets bolted on

**App**
- Frontend (TBD framework)
- Node/TS backend — chat orchestration, tool calls
- LangGraph for the agent loop; LangChain where it earns its keep
- RAG over a real document set

**Async**
- A real queue (SQS / Pub-Sub / Redis Streams / NATS — TBD), not in-memory promises pretending
- Idempotency keys on every side-effect

**Side-effects**
- Real API calls (train / hotel / calendar — TBD)
- Possibly real purchases. Sandbox first, hard per-call cap, single low-stakes merchant

**Infra**
- Containerised, deployed to Kubernetes
- Helm charts
- Terraform for cloud setup (GCP or AWS — TBD)
- CI/CD via GitHub Actions
- Observability — logs, metrics, tracing (stack TBD)

## Status

Day 0. Repo planted, nothing built yet.
