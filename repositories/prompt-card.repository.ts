import { prisma } from "@/lib/prisma";
import type { PromptType } from "@/types/domain";

export async function listPromptCards() {
  return prisma.promptCard.findMany({
    orderBy: [
      { type: "asc" },
      { isActive: "desc" },
      { updatedAt: "desc" }
    ]
  });
}

export async function findActivePromptCard(type: PromptType) {
  return prisma.promptCard.findFirst({
    where: {
      type,
      isActive: true
    },
    orderBy: {
      updatedAt: "desc"
    }
  });
}

export async function findPromptCardByTypeName(type: PromptType, name: string) {
  return prisma.promptCard.findUnique({
    where: {
      type_name: {
        type,
        name
      }
    }
  });
}

export async function findPromptCardById(promptCardId: string) {
  return prisma.promptCard.findUnique({
    where: { id: promptCardId }
  });
}

export async function listPromptCardsByType(type: PromptType) {
  return prisma.promptCard.findMany({
    where: { type },
    orderBy: [
      { isActive: "desc" },
      { updatedAt: "desc" }
    ]
  });
}

export async function upsertPromptCardByTypeName(input: {
  type: PromptType;
  name: string;
  content: string;
  isActive?: boolean;
}) {
  return prisma.promptCard.upsert({
    where: {
      type_name: {
        type: input.type,
        name: input.name
      }
    },
    update: {
      content: input.content,
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {})
    },
    create: {
      type: input.type,
      name: input.name,
      content: input.content,
      isActive: input.isActive ?? false
    }
  });
}

export async function createPromptCard(input: {
  type: PromptType;
  name: string;
  content: string;
  isActive?: boolean;
}) {
  return prisma.promptCard.create({
    data: {
      type: input.type,
      name: input.name,
      content: input.content,
      isActive: input.isActive ?? false
    }
  });
}

export async function updatePromptCard(
  promptCardId: string,
  input: {
    name?: string;
    content?: string;
  }
) {
  return prisma.promptCard.update({
    where: { id: promptCardId },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.content !== undefined ? { content: input.content } : {})
    }
  });
}

export async function deletePromptCard(promptCardId: string) {
  return prisma.promptCard.delete({
    where: { id: promptCardId }
  });
}

export async function activatePromptCard(promptCardId: string, type: PromptType) {
  return prisma.$transaction([
    prisma.promptCard.updateMany({
      where: { type },
      data: {
        isActive: false
      }
    }),
    prisma.promptCard.update({
      where: { id: promptCardId },
      data: {
        isActive: true
      }
    })
  ]);
}
