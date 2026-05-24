CREATE TABLE messages (
  id uuid PRIMARY KEY,
  role text NOT NULL,
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
