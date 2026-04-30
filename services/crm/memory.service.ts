import { listMemories, upsertMemory } from "@/repositories/memory.repository";
import type { TriggerDecision } from "@/types/domain";

export async function getMemoryContext(contactId: string) {
  const memories = await listMemories(contactId);

  if (!memories.length) {
    return "Belum ada memory penting.";
  }

  return memories.map((memory) => `${memory.key}: ${memory.value}`).join("\n");
}

export async function updateMemoryFromConversation(input: {
  contactId: string;
  senderName?: string;
  lastMessage: string;
  lastReply: string;
  triggerDecision: TriggerDecision;
}) {
  const operations = [
    upsertMemory(input.contactId, "last_user_message", input.lastMessage.slice(0, 500)),
    upsertMemory(input.contactId, "last_ai_reply", input.lastReply.slice(0, 500))
  ];

  if (input.senderName) {
    operations.push(upsertMemory(input.contactId, "display_name", input.senderName));
  }

  if (input.triggerDecision.matchedKeywords.length) {
    operations.push(
      upsertMemory(
        input.contactId,
        "interest_topics",
        input.triggerDecision.matchedKeywords.join(", ")
      )
    );
  }

  await Promise.all(operations);
}
