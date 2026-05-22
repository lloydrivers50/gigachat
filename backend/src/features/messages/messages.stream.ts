import { EventEmitter } from "node:events";

type Events = {
  token: [{ id: string; chunk: string }];
  done: [{ id: string }];
};
const emitter = new EventEmitter<Events>();

export function emitToken(id: string, chunk: string) {
  emitter.emit("token", { id, chunk });
}

export function emitDone(id: string) {
  emitter.emit("done", { id });
}

export { emitter };
