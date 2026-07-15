from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class ApiModel(BaseModel):
    model_config = ConfigDict(alias_generator=lambda value: "".join(
        word if index == 0 else word.capitalize()
        for index, word in enumerate(value.split("_"))
    ), populate_by_name=True, str_strip_whitespace=True)


class RiskLevel(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class ScoreSource(StrEnum):
    MOCK_RULE_BASED = "mock-rule-based"


class EmailOpenRequest(ApiModel):
    user_id: str = Field(min_length=1, max_length=128, pattern=r"^[A-Za-z0-9_-]+$")
    message_id: str = Field(min_length=1, max_length=512)
    sender_email: EmailStr
    sender_name: str = Field(min_length=1, max_length=320)
    subject: str = Field(min_length=1, max_length=998)
    opened_at: datetime

    @field_validator("sender_name", "subject")
    @classmethod
    def remove_control_characters(cls, value: str) -> str:
        return "".join(char for char in value if char.isprintable())


class TrackedEmailResponse(ApiModel):
    message_id: str
    sender_email: EmailStr
    sender_name: str
    subject: str
    visit_count: int = Field(ge=1)
    email_risk_score: int = Field(ge=0, le=100)
    risk_level: RiskLevel
    score_source: ScoreSource
    first_opened_at: datetime
    last_opened_at: datetime


class HealthResponse(ApiModel):
    status: str
    persistence: str
    deduplication_window_seconds: int


class AnalysisRiskLevel(StrEnum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"


class Classification(StrEnum):
    PHISHING = "phishing"
    LEGITIMATE = "legitimate"
    UNCERTAIN = "uncertain"


class AnalyzeEmailRequest(ApiModel):
    schema_version: str = Field(pattern=r"^1\.0$")
    message_id: str = Field(min_length=1, max_length=512)
    sender_email: EmailStr
    sender_name: str = Field(min_length=1, max_length=320)
    sender_domain: str = Field(min_length=1, max_length=253)
    subject: str = Field(min_length=1, max_length=998)
    opened_at: datetime
    links: list[str] = Field(default_factory=list, max_length=50)
    body_collection_authorized: bool = False
    body_text: str | None = Field(default=None, max_length=20_000)

    @field_validator("body_text")
    @classmethod
    def require_body_authorization(cls, value: str | None, info):
        if value and not info.data.get("body_collection_authorized", False):
            raise ValueError("bodyText requires explicit bodyCollectionAuthorized=true")
        return value


class DetectedBehavior(ApiModel):
    type: str
    confidence: float = Field(ge=0, le=1)
    evidence: str


class AnalyzeEmailResponse(ApiModel):
    message_id: str
    classification: Classification
    email_risk_score: int = Field(ge=0, le=100)
    risk_level: AnalysisRiskLevel
    score_source: str = Field(pattern=r"^(rule-based|ml-model)$")
    detected_behaviors: list[DetectedBehavior]
    recommendation: str
    model_version: str | None = None
