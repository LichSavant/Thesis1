export type RiskLevel = "low" | "medium" | "high";
export type ScoreSource = "mock-rule-based";
export type AnalysisRiskLevel = "low" | "moderate" | "high" | "critical";
export type Classification = "phishing" | "legitimate" | "uncertain";

export interface EmailOpenRequest {
  userId: string;
  messageId: string;
  senderEmail: string;
  senderName: string;
  subject: string;
  openedAt: string;
}

export interface EmailSourceMetadata extends EmailOpenRequest {
  senderDomain: string;
  links?: string[];
  bodyText?: string;
}

export interface AnalyzeEmailRequest {
  schemaVersion: "1.0";
  messageId: string;
  senderEmail: string;
  senderName: string;
  senderDomain: string;
  subject: string;
  openedAt: string;
  links: string[];
  bodyText?: string;
  bodyCollectionAuthorized: boolean;
}

export interface DetectedBehavior {
  type: string;
  confidence: number;
  evidence: string;
}

export interface EmailAnalysis {
  messageId: string;
  classification: Classification;
  emailRiskScore: number;
  riskLevel: AnalysisRiskLevel;
  scoreSource: "rule-based" | "ml-model";
  detectedBehaviors: DetectedBehavior[];
  recommendation: string;
  modelVersion: string | null;
}

export interface TrackedEmail {
  messageId: string;
  senderEmail: string;
  senderName: string;
  subject: string;
  visitCount: number;
  emailRiskScore: number;
  riskLevel: RiskLevel;
  scoreSource: ScoreSource;
  firstOpenedAt: string;
  lastOpenedAt: string;
}
