import type { TrackedEmail } from "@phishing-defense/shared";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export async function getTrackedEmails(): Promise<TrackedEmail[]> {
  const response = await fetch(`${API}/api/v1/tracked-emails`);
  if (!response.ok) throw new Error(`Backend returned ${response.status}`);
  return await response.json() as TrackedEmail[];
}
