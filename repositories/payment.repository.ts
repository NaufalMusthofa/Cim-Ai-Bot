import { prisma } from "@/lib/prisma";
import type { PaymentStatus, PlanType } from "@/types/domain";

export async function createPaymentRequest(input: {
  profileId: string;
  plan: PlanType;
  amount: number;
  proofUrl: string;
  proofPath: string;
  senderNote?: string;
}) {
  return prisma.paymentRequest.create({
    data: {
      profileId: input.profileId,
      plan: input.plan,
      amount: input.amount,
      proofUrl: input.proofUrl,
      proofPath: input.proofPath,
      senderNote: input.senderNote || undefined
    }
  });
}

export async function findPendingPaymentRequestByProfile(profileId: string) {
  return prisma.paymentRequest.findFirst({
    where: {
      profileId,
      status: "PENDING"
    },
    orderBy: {
      requestedAt: "desc"
    }
  });
}

export async function findLatestPaymentRequestByProfile(profileId: string) {
  return prisma.paymentRequest.findFirst({
    where: { profileId },
    orderBy: {
      requestedAt: "desc"
    }
  });
}

export async function findPaymentRequestById(paymentRequestId: string) {
  return prisma.paymentRequest.findUnique({
    where: { id: paymentRequestId },
    include: {
      profile: true
    }
  });
}

export async function updatePaymentRequest(
  paymentRequestId: string,
  input: {
    status?: PaymentStatus;
    reviewedAt?: Date | null;
    reviewedByEmail?: string | null;
    reviewNote?: string | null;
  }
) {
  return prisma.paymentRequest.update({
    where: { id: paymentRequestId },
    data: {
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.reviewedAt !== undefined ? { reviewedAt: input.reviewedAt } : {}),
      ...(input.reviewedByEmail !== undefined ? { reviewedByEmail: input.reviewedByEmail } : {}),
      ...(input.reviewNote !== undefined ? { reviewNote: input.reviewNote } : {})
    }
  });
}

export async function listPaymentRequests(status?: PaymentStatus) {
  return prisma.paymentRequest.findMany({
    where: status
      ? {
          status
        }
      : undefined,
    include: {
      profile: true
    },
    orderBy: {
      requestedAt: "desc"
    }
  });
}
