import { connection } from "../../queue/connection";
import IORedis from "ioredis";

export const CHANNEL = "tokens";
const pub = new IORedis(connection);

// SAME signature as GIGA-6 — callers (the worker) don't change
export function emitToken(id: string, chunk: string) {
  pub.publish(CHANNEL, JSON.stringify({ type: "token", id, chunk }));
}
export function emitDone(id: string) {
  pub.publish(CHANNEL, JSON.stringify({ type: "done", id }));
}

// A subscribed Redis connection can't issue other commands, so the subscriber
// gets its own dedicated connection, cloned from the publisher's config.
export const sub = pub.duplicate();
