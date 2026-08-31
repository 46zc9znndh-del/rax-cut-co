import "server-only";

import { Resend } from "resend";
import { getEmailConfig } from "./config";

let client: Resend | null = null;

export function getResendClient() {
  const { apiKey } = getEmailConfig();
  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY");
  }

  if (!client) {
    client = new Resend(apiKey);
  }

  return client;
}
