import { prisma } from "@/lib/prisma";

export async function listMemories(contactId: string) {
  return prisma.memoryEntry.findMany({
    where: { contactId },
    orderBy: {
      updatedAt: "desc"
    }
  });
}

export async function upsertMemory(contactId: string, key: string, value: string) {
  return prisma.memoryEntry.upsert({
    where: {
      contactId_key: {
        contactId,
        key
      }
    },
    update: {
      value
    },
    create: {
      contactId,
      key,
      value
    }
  });
}
