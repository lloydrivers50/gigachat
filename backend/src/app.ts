import express, { type Express } from "express";
import { healthRouter } from "./features/health";
import { messagesRouter } from "./features/messages";

export function createApp(): Express {
  const app = express();

  app.use(express.json());
  app.use(messagesRouter);
  app.use(healthRouter);

  return app;
}
