import type { EmailAnalysis, EmailSourceMetadata, TrackedEmail } from "@phishing-defense/shared";
export interface ExtensionResult { trackedEmail: TrackedEmail; analysis: EmailAnalysis; }
export type RuntimeMessage =
  | { type: "PROCESS_EMAIL"; email: EmailSourceMetadata }
  | { type: "GET_CURRENT_EMAIL" }
  | { type: "GET_LAST_RESULT" };
