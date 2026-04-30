import { prisma } from "@/lib/prisma";
import type { ContactMode } from "@/types/domain";

export async function findOrCreateContact(profileId: string, phone: string, displayName?: string) {
  return prisma.contact.upsert({
    where: {
      profileId_phone: {
        profileId,
        phone
      }
    },
    update: {
      displayName: displayName || undefined,
      lastInboundAt: new Date()
    },
    create: {
      profileId,
      phone,
      displayName,
      lastInboundAt: new Date()
    }
  });
}

export async function updateContactAfterReply(contactId: string, timestamp: Date) {
  return prisma.contact.update({
    where: { id: contactId },
    data: {
      lastInteraction: timestamp
    }
  });
}

export async function updateContactMode(contactId: string, mode: ContactMode) {
  return prisma.contact.update({
    where: { id: contactId },
    data: {
      mode
    }
  });
}

export async function findContactByIdForProfile(profileId: string, contactId: string) {
  return prisma.contact.findFirst({
    where: {
      id: contactId,
      profileId
    }
  });
}

export async function incrementFollowupCount(contactId: string) {
  return prisma.contact.update({
    where: { id: contactId },
    data: {
      followupCount: {
        increment: 1
      }
    }
  });
}

export async function listContactsByProfile(profileId: string) {
  return prisma.contact.findMany({
    where: { profileId },
    include: {
      memories: true,
      conversations: {
        include: {
          messages: {
            orderBy: {
              createdAt: "desc"
            },
            take: 1
          }
        }
      }
    },
    orderBy: {
      updatedAt: "desc"
    }
  });
}

export async function listChatContactsByProfile(profileId: string) {
  return prisma.contact.findMany({
    where: { profileId },
    include: {
      conversations: {
        orderBy: {
          updatedAt: "desc"
        },
        take: 1,
        include: {
          messages: {
            orderBy: {
              createdAt: "desc"
            },
            take: 1
          }
        }
      }
    },
    orderBy: [
      {
        lastInboundAt: "desc"
      },
      {
        updatedAt: "desc"
      }
    ]
  });
}

export async function countContactsByProfile(profileId: string) {
  return prisma.contact.count({
    where: { profileId }
  });
}
