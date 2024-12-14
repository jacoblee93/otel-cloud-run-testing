import "dotenv/config";

import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { AISDKExporter } from "langsmith/vercel";

import express, { type Request, type Response }  from "express";

const app = express()
const port = 3000

app.get('/', async (_req: Request, res: Response) => {
  const result = await generateText({
    model: openai("gpt-4o-mini"),
    prompt: "How are you?",
    experimental_telemetry: AISDKExporter.getSettings(),
  });
  res.send(result);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
