import "server-only";

import { z } from "zod";

const serverEnvSchema = z.object({
  API_BASE_URL: z.string().url().optional(),
  API_KEY: z.string().min(1).optional(),
});

const rawServerEnv = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.VITE_API_BASE_URL,
  API_KEY: process.env.NEXT_PUBLIC_API_KEY ?? process.env.VITE_API_KEY,
};

export const serverEnv = serverEnvSchema.parse(rawServerEnv);

export const publicEnv = {
  apiBaseUrl: serverEnv.API_BASE_URL ?? "",
};
