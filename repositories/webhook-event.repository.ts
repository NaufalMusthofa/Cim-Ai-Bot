import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function createWebhookEvent(profileId: string, dedupeKey: string, payload: Record<string, unknown>) {
  try {
    return await prisma.webhookEvent.create({
      data: {
        profileId,
        dedupeKey,
        payload: payload as Prisma.InputJsonValue
      }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return null;
    }

    throw error;
  }
}

export async function updateWebhookEventStatus(
  eventId: string,
  input: {
    status: "PROCESSED" | "FAILED" | "IGNORED" | "DUPLICATE";
    error?: string;
  }
) {
  return prisma.webhookEvent.update({
    where: { id: eventId },
    data: {
      status: input.status,
      error: input.error,
      processedAt: new Date()
    }
  });
}
