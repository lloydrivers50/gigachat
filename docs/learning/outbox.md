**Takeaway:**  
For gigachat, the **outbox table _is_ the durability boundary**, and its **primary key _is_ the idempotency key**.  
Everything else hangs off that.

Below is the **production‑grade schema** you actually want — shaped around your design notes: durability, idempotency, resumability, compensation.

---

# 🧱 Outbox Schema (the one that fits gigachat)

## 🎯 Core idea

Each “dangerous” operation (booking, cancelling, emailing, charging) is:

1. **Written to the outbox table** in the _same transaction_ as the user confirmation
2. **Picked up by a worker**
3. **Executed exactly once** thanks to the idempotency key
4. **Updated with result + error + compensation info**

This is the Stripe / Uber / DoorDash pattern.

---

# 📦 The Table

## **outbox_messages**

This is the _only_ table you need for the outbox itself.

| Column              | Type          | Purpose                                                                  |
| ------------------- | ------------- | ------------------------------------------------------------------------ |
| **idempotency_key** | `uuid` (PK)   | The _idempotency key_ and the _primary key_. One row = one intent.       |
| **user_id**         | `uuid`        | Who triggered the action.                                                |
| **tool_name**       | `text`        | e.g. `"book_flight"`, `"book_hotel"`, `"send_email"`.                    |
| **payload**         | `jsonb`       | The exact arguments the tool will receive.                               |
| **status**          | `text`        | `"pending"`, `"processing"`, `"completed"`, `"failed"`, `"compensated"`. |
| **attempt_count**   | `int`         | How many times the worker has tried.                                     |
| **last_error**      | `text`        | Error message from last attempt.                                         |
| **result**          | `jsonb`       | The tool’s output (e.g. booking reference).                              |
| **created_at**      | `timestamptz` | Insert time.                                                             |
| **updated_at**      | `timestamptz` | Last state change.                                                       |

---

# 🧩 Why the PK _is_ the idempotency key

This gives you:

### 1. **Atomicity**

User confirms →  
**INSERT INTO outbox_messages (idempotency_key, payload, …)**  
and  
**persist the chat turn**  
in the _same transaction_.

Crash after commit?  
Worker still sees the row.

Crash before commit?  
No row → no booking.

### 2. **Exactly‑once semantics**

Worker does:

```sql
UPDATE outbox_messages
SET status = 'processing'
WHERE idempotency_key = $1
  AND status = 'pending';
```

If 2 workers race, only one wins the row‑level lock.

### 3. **Deduplication**

If the agent retries the same booking tool call with the same key:

- Row already exists → worker replays `result`
- No second booking
- No second charge
- No double email

### 4. **Natural join with saga log**

Your saga table can reference the same key.

---

# 🔄 Status lifecycle (the real one you’ll use)

```
pending → processing → completed
                 ↘
                  failed → (retry or compensate)
```

### **pending**

Row created. Worker hasn’t touched it.

### **processing**

Worker has locked it and is executing the tool.

### **completed**

Tool succeeded. `result` contains booking reference, etc.

### **failed**

Tool threw. Worker increments `attempt_count`, stores `last_error`.

### **compensated**

If part of a saga, compensation succeeded (e.g. flight cancelled).

---

# 🧠 Worker behaviour (the correct one)

1. SELECT next pending row
2. `UPDATE … WHERE status='pending'` to claim it
3. Run the tool
4. On success → `status='completed'`, store result
5. On failure →
   - increment attempt_count
   - store error
   - retry with exponential backoff
   - after N failures → escalate to saga compensator

---

# 🧱 Optional companion table: **saga_log**

If you want multi‑step itineraries:

| Column              | Type    | Purpose                               |
| ------------------- | ------- | ------------------------------------- |
| **idempotency_key** | `uuid`  | FK to outbox row                      |
| **step_name**       | `text`  | `"book_flight"`, `"book_hotel"`       |
| **status**          | `text`  | `"done"`, `"compensated"`, `"failed"` |
| **details**         | `jsonb` | booking refs, cancellation refs       |

This lets you resume after worker crash or partial failure.

---

# 🧭 Why this schema fits gigachat perfectly

Your design notes emphasise:

- **Durability** → outbox row is the durable intent
- **Idempotency** → PK is the dedupe key
- **Resumability** → worker restarts pick up where they left off
- **Compensation** → saga log ties into the same key

This schema is the minimal, correct, senior‑grade version of all four.

---

# 🎯 Next step

Do you want to:

- **Design the worker loop**
- **Design the saga layer**
- **Design the booking tool interface**
- **Decide who generates the idempotency key**

Pick one and we go deeper.
