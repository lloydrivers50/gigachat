import { Queue } from "bullmq";
import { connection } from "./connection";

type ReplyJob = {
  id: string;
};

const replyQueue = new Queue<ReplyJob>("reply", { connection });

export function enqueueReply(id: string) {
  return replyQueue.add("reply", { id });
}
