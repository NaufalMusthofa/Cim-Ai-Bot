import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function createMessage(input: {
  conversationId: string;
  contactId: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  externalId?: string;
  inboxId?: string;
  metadata?: Record<string, unknown> | null;
}) {
  return prisma.message.create({
    data: {
      conversationId: input.conversationId,
      contactId: input.contactId,
      role: input.role,
      content: input.content,
      externalId: input.externalId,
      inboxId: input.inboxId,
      metadata: (input.metadata as Prisma.InputJsonValue | undefined) ?? undefined
    }
  });
}

export async function listRecentMessages(conversationId: string, limit = 12) {
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: {
      createdAt: "desc"
    },
    take: limit
  });

  return messages.reverse();
}
