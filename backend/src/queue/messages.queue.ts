import { Queue } from "bullmq";
import { connection } from "./connection";

type ReplyJob = {
  id: string;
  text: string;
};

const replyQueue = new Queue<ReplyJob>("reply", { connection });

export function enqueueReply(id: string, text: string) {
  return replyQueue.add("reply", { id, text });
}
