import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Popup } from "./popup";

describe("extension popup", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("displays returned visit count", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({
      messageId: "demo-message-001", senderEmail: "unknown@example.com", senderName: "Unknown Sender",
      subject: "Verify your account immediately", visitCount: 3, emailRiskScore: 75, riskLevel: "high",
      scoreSource: "mock-rule-based", firstOpenedAt: "2026-01-01T00:00:00Z", lastOpenedAt: "2026-01-01T00:01:00Z"
    }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({
        messageId: "demo-message-001", classification: "uncertain", emailRiskScore: 40, riskLevel: "moderate",
        scoreSource: "rule-based", detectedBehaviors: [{ type: "urgency", confidence: .91, evidence: "immediately" }],
        recommendation: "Verify the sender before clicking links.", modelVersion: null
      }) }));
    render(<Popup />);
    fireEvent.click(screen.getByRole("button", { name: "Analyze Test Email" }));
    expect(await screen.findByTestId("visit-count")).toHaveTextContent("3");
    expect(screen.getByText(/not a trained ML prediction/)).toBeInTheDocument();
  });

  it("shows an understandable API failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("network")));
    render(<Popup />);
    fireEvent.click(screen.getByRole("button", { name: "Analyze Test Email" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Backend offline");
    expect(screen.getByRole("alert")).toHaveTextContent("Start FastAPI");
  });
});
