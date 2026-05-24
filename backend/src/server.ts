import { createApp } from "./app";
import { logger } from "./logger";

const PORT = Number(process.env.PORT ?? 3000);

const app = createApp();

app.listen(PORT, () => {
  logger.info({ port: PORT }, "backend listening");
});
