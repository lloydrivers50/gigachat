import { pool } from "../../db/pool";
import type { Message } from "./messages.types";

export async function addMessage(m: Message) {
  await pool.query(
    "INSERT INTO messages (id, role, text) VALUES ($1, $2, $3)",
    [m.id, m.role, m.text],
  );
  return m;
}
export async function getMessages(): Promise<Message[]> {
  const result = await pool.query(
    "SELECT id, role, text FROM messages ORDER BY created_at"
  );
  return result.rows;
}
