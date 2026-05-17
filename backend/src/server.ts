import { createApp } from "./app";

const PORT = Number(process.env.PORT ?? 3000);

const app = createApp();

app.listen(PORT, () => {
  console.log(`gigachat backend listening on http://localhost:${PORT}`);
});
