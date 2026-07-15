export type EmailSourceMode = "mock" | "gmail";
export interface ExtensionSettings { backendUrl: string; sourceMode: EmailSourceMode; automaticTracking: boolean; includeLinks: boolean; }
const defaults: ExtensionSettings = { backendUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000", sourceMode: "mock", automaticTracking: false, includeLinks: false };

export async function loadSettings(): Promise<ExtensionSettings> {
  if (typeof chrome === "undefined" || !chrome.storage) return defaults;
  const result = await chrome.storage.local.get(Object.keys(defaults));
  return { ...defaults, ...result } as ExtensionSettings;
}
export async function saveSettings(settings: ExtensionSettings): Promise<void> {
  if (typeof chrome !== "undefined" && chrome.storage) await chrome.storage.local.set(settings);
}
