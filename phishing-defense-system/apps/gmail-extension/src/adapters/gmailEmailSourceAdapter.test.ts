import { describe, expect, it } from "vitest";
import fixture from "../fixtures/gmail-open-message.html?raw";
import { GmailEmailSourceAdapter } from "./gmailEmailSourceAdapter";
import { extractDomain, identityFromHash, parseSender } from "./gmailParsing";

describe("Gmail parsing", () => {
  it("parses display name and sender email", () => expect(parseSender("Jane Doe <jane@example.com>")).toEqual({ name: "Jane Doe", email: "jane@example.com" }));
  it("extracts sender domain", () => expect(extractDomain("Jane@Example.COM")).toBe("example.com"));
  it("extracts a route message identity", () => expect(identityFromHash("#inbox/FMfcgzQZSabcdefghijkl")).toBe("gmail-route:FMfcgzQZSabcdefghijkl"));
});

describe("GmailEmailSourceAdapter fixture", () => {
  it("extracts only the opened fixture message metadata", async () => {
    document.body.innerHTML = fixture;
    const result = await new GmailEmailSourceAdapter(document, { includeLinks: true }).extractCurrentEmail();
    expect(result.messageId).toBe("fixture-message-123");
    expect(result.senderEmail).toBe("security@unrelated-example.com");
    expect(result.senderDomain).toBe("unrelated-example.com");
    expect(result.subject).toContain("Microsoft");
    expect(result.links).toHaveLength(1);
    expect(result.bodyText).toBeUndefined();
  });
  it("fails gracefully when no message is selected", async () => {
    document.body.innerHTML = "<main role='main'></main>";
    await expect(new GmailEmailSourceAdapter(document).extractCurrentEmail()).rejects.toThrow("Open a Gmail message");
  });
});
