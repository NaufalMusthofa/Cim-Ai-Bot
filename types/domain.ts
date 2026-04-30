export type PlanType = "FREE" | "PRO";
export type FollowupStage = 1 | 2 | 3;
export type AssistantMode = "PERSONAL" | "SALES";
export type ContactMode = "AI" | "HUMAN";
export type PaymentStatus = "PENDING" | "APPROVED" | "REJECTED";
export type PromptType =
  | "SYSTEM_BASE"
  | "PERSONAL_MODE"
  | "SALES_MODE"
  | "FALLBACK_PERSONAL"
  | "FALLBACK_SALES"
  | "FOLLOWUP_STAGE_1"
  | "FOLLOWUP_STAGE_2"
  | "FOLLOWUP_STAGE_3";

export interface SubscriptionWindow {
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
}

export interface AttachmentMetadata {
  url?: string;
  filename?: string;
  mimetype?: string;
}

export interface InboundWebhookPayload {
  eventId: string;
  sender: string;
  senderName?: string;
  message: string;
  timestamp: Date;
  inboxId?: string;
  isGroup: boolean;
  attachment?: AttachmentMetadata | null;
  raw: Record<string, unknown>;
}

export interface TriggerDecision {
  matchedKeywords: string[];
  promotionSnippet?: string;
  qualifiesForFollowup: boolean;
}

export interface HistoryMessage {
  role: "USER" | "ASSISTANT" | "HUMAN" | "SYSTEM";
  content: string;
}

export interface AssistantModeDecision {
  mode: AssistantMode;
  reason: string;
  shouldPersistHint: boolean;
}

export interface OrchestratorContext {
  profileId: string;
  profileEmail: string;
  plan: PlanType;
  contactId: string;
  conversationId: string;
  sender: string;
  inboxId?: string;
}
