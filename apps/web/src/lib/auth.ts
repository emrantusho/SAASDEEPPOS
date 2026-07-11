import { createAuth } from "@saasdeep/auth";
import { db } from "./db";
import { serverUrls } from "@saasdeep/env/server";

export const auth = createAuth({
  db: db as any,
  baseURL: serverUrls.betterAuthUrl,
});
