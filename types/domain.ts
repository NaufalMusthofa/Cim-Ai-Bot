export type PlanType = "FREE" | "PRO";
export type FollowupStage = 1 | 2 | 3;

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

export interface OrchestratorContext {
  profileId: string;
  profileEmail: string;
  plan: PlanType;
  contactId: string;
  conversationId: string;
  sender: string;
  inboxId?: string;
}
