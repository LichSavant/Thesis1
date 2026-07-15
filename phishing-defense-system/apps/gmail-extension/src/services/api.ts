import type { AnalyzeEmailRequest, EmailAnalysis, EmailSourceMetadata, TrackedEmail } from "@phishing-defense/shared";
import type { ExtensionResult } from "../messages";

export class ApiError extends Error { constructor(message: string, readonly offline = false) { super(message); } }

async function request<T>(baseUrl: string, path: string, body: unknown): Promise<T> {
  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}${path}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
    });
    if (!response.ok) throw new ApiError(`Request failed (${response.status}). Check the email data and backend.`);
    return await response.json() as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Cannot reach the backend. Start FastAPI and check the backend URL.", true);
  }
}

export async function processEmail(baseUrl: string, email: EmailSourceMetadata): Promise<ExtensionResult> {
  const trackedEmail = await request<TrackedEmail>(baseUrl, "/api/v1/interactions/email-open", email);
  const analysisRequest: AnalyzeEmailRequest = {
    schemaVersion: "1.0", messageId: email.messageId, senderEmail: email.senderEmail,
    senderName: email.senderName, senderDomain: email.senderDomain, subject: email.subject,
    openedAt: email.openedAt, links: email.links ?? [], bodyText: email.bodyText,
    bodyCollectionAuthorized: Boolean(email.bodyText)
  };
  const analysis = await request<EmailAnalysis>(baseUrl, "/api/v1/analyze-email", analysisRequest);
  return { trackedEmail, analysis };
}
