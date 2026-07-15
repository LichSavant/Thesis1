import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";
import { getTrackedEmails } from "./api";

vi.mock("./api", () => ({ getTrackedEmails: vi.fn() }));
const mockedGet = vi.mocked(getTrackedEmails);

describe("dashboard", () => {
  beforeEach(() => mockedGet.mockReset());

  it("renders loading state", async () => {
    let finish!: (value: []) => void;
    mockedGet.mockReturnValue(new Promise<[]>((resolve) => { finish = resolve; }));
    render(<App />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading tracked emails");
    finish([]);
    await screen.findByText("No tracked emails yet");
  });

  it("renders empty state", async () => {
    mockedGet.mockResolvedValue([]);
    render(<App />);
    expect(await screen.findByText("No tracked emails yet")).toBeInTheDocument();
  });

  it("renders a tracked email record", async () => {
    mockedGet.mockResolvedValue([{
      messageId: "demo-message-001", senderEmail: "unknown@example.com", senderName: "Unknown Sender",
      subject: "Verify your account immediately", visitCount: 2, emailRiskScore: 75, riskLevel: "high",
      scoreSource: "mock-rule-based", firstOpenedAt: "2026-01-01T00:00:00Z", lastOpenedAt: "2026-01-01T00:01:00Z"
    }]);
    render(<App />);
    expect(await screen.findByText("unknown@example.com")).toBeInTheDocument();
    expect(screen.getByText("75%")).toBeInTheDocument();
    expect(screen.getByText("mock-rule-based")).toBeInTheDocument();
  });
});
