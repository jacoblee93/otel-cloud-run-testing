import "dotenv/config";

import { AISDKExporter } from "langsmith/vercel";

import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";

const sdk = new NodeSDK({
  traceExporter: new AISDKExporter(),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

