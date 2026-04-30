import { prisma } from "@/lib/prisma";

export async function findOrCreateConversation(contactId: string) {
  const existing = await prisma.conversation.findFirst({
    where: { contactId },
    orderBy: {
      updatedAt: "desc"
    }
  });

  if (existing) {
    return existing;
  }

  return prisma.conversation.create({
    data: {
      contactId
    }
  });
}

export async function touchConversation(conversationId: string, date: Date) {
  return prisma.conversation.update({
    where: { id: conversationId },
    data: {
      lastMessageAt: date
    }
  });
}

export async function listConversationsByProfile(profileId: string) {
  return prisma.conversation.findMany({
    where: {
      contact: {
        profileId
      }
    },
    include: {
      contact: true,
      messages: {
        orderBy: {
          createdAt: "desc"
        },
        take: 12
      }
    },
    orderBy: {
      updatedAt: "desc"
    }
  });
}
