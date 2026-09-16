import "server-only";

import { serverEnv } from "@/config/env";
import { createApiClient } from "./client";

export const serverApi = createApiClient({
  baseUrl: serverEnv.API_BASE_URL ?? "",
  apiKey: serverEnv.API_KEY,
});
