import { GmailEmailSourceAdapter } from "./adapters/gmailEmailSourceAdapter";
import { EmailSourceUnavailableError } from "./adapters/emailSourceAdapter";
import type { RuntimeMessage } from "./messages";
import { loadSettings } from "./services/settings";
import { AutoTrackingGuard } from "./services/autoTrackingGuard";

const trackingGuard = new AutoTrackingGuard();
let debounceTimer: number | undefined;

async function extractCurrent() {
  const settings = await loadSettings();
  return new GmailEmailSourceAdapter(document, { includeLinks: settings.includeLinks }).extractCurrentEmail();
}

chrome.runtime.onMessage.addListener((message: RuntimeMessage, _sender, sendResponse) => {
  if (message.type !== "GET_CURRENT_EMAIL") return false;
  void extractCurrent().then((email) => sendResponse({ ok: true, email })).catch((error) => sendResponse({
    ok: false, error: error instanceof EmailSourceUnavailableError ? error.message : "Gmail metadata is unavailable."
  }));
  return true;
});

async function considerAutomaticTracking(): Promise<void> {
  const settings = await loadSettings();
  if (!settings.automaticTracking || settings.sourceMode !== "gmail") return;
  try {
    const email = await extractCurrent();
    if (!trackingGuard.shouldTrack(email.messageId)) return;
    await chrome.runtime.sendMessage({ type: "PROCESS_EMAIL", email } satisfies RuntimeMessage);
  } catch {
    // A closed conversation or Gmail layout change is an unavailable state, not a page error.
  }
}

const observeTarget = document.querySelector("main, [role='main']") ?? document.body;
const observer = new MutationObserver(() => {
  window.clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(() => void considerAutomaticTracking(), 600);
});
observer.observe(observeTarget, { childList: true, subtree: true });
window.addEventListener("pagehide", () => { observer.disconnect(); window.clearTimeout(debounceTimer); }, { once: true });
void considerAutomaticTracking();
