import { prisma } from "@/lib/prisma";

export async function listFollowupsByContact(contactId: string) {
  return prisma.followupJob.findMany({
    where: { contactId },
    orderBy: {
      createdAt: "asc"
    }
  });
}

export async function scheduleFollowupStage(contactId: string, stage: "STAGE_1" | "STAGE_2" | "STAGE_3", dueAt: Date) {
  const existing = await prisma.followupJob.findUnique({
    where: {
      contactId_stage: {
        contactId,
        stage
      }
    }
  });

  if (!existing) {
    return prisma.followupJob.create({
      data: {
        contactId,
        stage,
        dueAt
      }
    });
  }

  if (existing.status === "SENT") {
    return existing;
  }

  return prisma.followupJob.update({
    where: { id: existing.id },
    data: {
      dueAt,
      status: "PENDING",
      cancelledAt: null,
      lastError: null
    }
  });
}

export async function cancelPendingFollowups(contactId: string) {
  return prisma.followupJob.updateMany({
    where: {
      contactId,
      status: "PENDING"
    },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date()
    }
  });
}

export async function listDueFollowups(now: Date) {
  return prisma.followupJob.findMany({
    where: {
      status: "PENDING",
      dueAt: {
        lte: now
      }
    },
    include: {
      contact: {
        include: {
          profile: true
        }
      }
    },
    orderBy: {
      dueAt: "asc"
    },
    take: 50
  });
}

export async function markFollowupSent(jobId: string) {
  return prisma.followupJob.update({
    where: { id: jobId },
    data: {
      status: "SENT",
      sentAt: new Date(),
      lastError: null
    }
  });
}

export async function markFollowupFailed(jobId: string, error: string) {
  return prisma.followupJob.update({
    where: { id: jobId },
    data: {
      lastError: error
    }
  });
}
