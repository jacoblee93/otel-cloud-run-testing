import "dotenv/config";
import cors from "cors";

import { generateObject, generateText, streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { AISDKExporter } from "langsmith/vercel";
import { traceable } from "langsmith/traceable";
import express, { NextFunction, type Request, type Response } from "express";
import { z } from "zod";

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

export async function handleStreamChat(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { messages } = req.body;

    // Ideally we have this 1 trace catch everything in it
    const result = await traceable(streamText, {
      name: "table-agent",
    })({
      model: openai("gpt-4o-mini"),
      messages: messages,
      maxSteps: 10,
      experimental_telemetry: AISDKExporter.getSettings({
        isEnabled: true,
        runName: "chat",
      }),
      tools: {
        generateRandomText: {
          description: "Generates random test text",
          parameters: z.object({
            length: z.number().describe("Length of random text to generate"),
          }),
          execute: async ({ length }: { length: number }) => {
            console.log("testobject");

            const testobject = await generateText({
              model: openai("gpt-4o-mini"),
              prompt: `Generate ${length} random words`,
              experimental_telemetry: AISDKExporter.getSettings({
                isEnabled: true,
                runName: "generateRandomText",
              }),
            });

            return testobject.text;
          },
        },
        getWeatherInformation: {
          description: "show the weather in a given city to the user",
          parameters: z.object({ city: z.string() }),
          execute: async ({}: { city: string }) => {
            const weatherOptions = [
              "sunny",
              "cloudy",
              "rainy",
              "snowy",
              "windy",
            ];
            return weatherOptions[
              Math.floor(Math.random() * weatherOptions.length)
            ];
          },
        },
        // client-side tool that starts user interaction:
        askForConfirmation: {
          description: "Ask the user for confirmation.",
          parameters: z.object({
            message: z
              .string()
              .describe("The message to ask for confirmation."),
          }),
        },
        // client-side tool that is automatically executed on the client:
        getLocation: {
          description:
            "Get the user location. Always ask for confirmation before using this tool.",
          parameters: z.object({}),
        },
      },
    });

    result.pipeDataStreamToResponse(res);
  } catch (error: any) {
    return next(error);
  }
}

app.post("/chat", handleStreamChat);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
