import { randomUUID } from "node:crypto";
import { PRO_PLAN_AMOUNT } from "@/lib/constants";
import { getPaymentProofBucket } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createPaymentRequest,
  findLatestPaymentRequestByProfile,
  findPaymentRequestById,
  findPendingPaymentRequestByProfile,
  updatePaymentRequest
} from "@/repositories/payment.repository";
import { clearUpgradeRequest } from "@/repositories/profile.repository";
import { activateProPlan } from "@/services/subscription/subscription.service";
import { sendAdminPaymentNotification } from "@/services/payment/admin-notification.service";
import type { PlanType } from "@/types/domain";

async function ensurePaymentProofBucket() {
  const bucket = getPaymentProofBucket();
  const admin = createAdminClient();
  const { data: buckets, error: listError } = await admin.storage.listBuckets();

  if (listError) {
    throw new Error(`Gagal memeriksa bucket bukti transfer: ${listError.message}`);
  }

  const exists = buckets.some((item) => item.name === bucket);

  if (exists) {
    return bucket;
  }

  const { error: createError } = await admin.storage.createBucket(bucket, {
    public: false,
    fileSizeLimit: "5MB"
  });

  if (createError && !createError.message.toLowerCase().includes("already exists")) {
    throw new Error(`Gagal membuat bucket bukti transfer: ${createError.message}`);
  }

  return bucket;
}

async function uploadPaymentProof(profileId: string, file: File) {
  if (!file || file.size <= 0) {
    throw new Error("Bukti transfer wajib diunggah.");
  }

  const bucket = await ensurePaymentProofBucket();
  const admin = createAdminClient();
  const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const proofPath = `${profileId}/${Date.now()}-${randomUUID()}-${safeFilename}`;
  const buffer = await file.arrayBuffer();

  const { error } = await admin.storage.from(bucket).upload(proofPath, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false
  });

  if (error) {
    throw new Error(`Gagal upload bukti transfer: ${error.message}`);
  }

  return {
    proofPath,
    proofUrl: `${bucket}/${proofPath}`
  };
}

export async function getPaymentProofSignedUrl(proofPath: string, expiresIn = 3600) {
  const bucket = getPaymentProofBucket();
  const admin = createAdminClient();
  const { data, error } = await admin.storage.from(bucket).createSignedUrl(proofPath, expiresIn);

  if (error) {
    return null;
  }

  return data.signedUrl;
}

export async function submitPaymentRequest(input: {
  profileId: string;
  tenantEmail: string;
  businessName?: string | null;
  tenantPhone?: string | null;
  file: File;
  senderNote?: string;
  plan?: PlanType;
}) {
  const existingPending = await findPendingPaymentRequestByProfile(input.profileId);

  if (existingPending) {
    throw new Error("Masih ada pembayaran yang menunggu review admin.");
  }

  const plan = input.plan || "PRO";
  const { proofPath, proofUrl } = await uploadPaymentProof(input.profileId, input.file);
  const paymentRequest = await createPaymentRequest({
    profileId: input.profileId,
    plan,
    amount: PRO_PLAN_AMOUNT,
    proofPath,
    proofUrl,
    senderNote: input.senderNote
  });

  let adminNotification: {
    ok: boolean;
    reason: string | null;
  } = {
    ok: true,
    reason: null
  };

  try {
    const result = await sendAdminPaymentNotification({
      tenantEmail: input.tenantEmail,
      businessName: input.businessName,
      tenantPhone: input.tenantPhone,
      plan,
      amount: paymentRequest.amount,
      requestedAt: paymentRequest.requestedAt,
      senderNote: paymentRequest.senderNote
    });

    adminNotification = {
      ok: result.ok,
      reason: result.ok ? null : result.reason
    };
  } catch (error) {
    adminNotification = {
      ok: false,
      reason: error instanceof Error ? error.message : "unknown_admin_notification_error"
    };
    console.error("[payment] admin notification failed", error);
  }

  return {
    paymentRequest,
    adminNotification
  };
}

export async function approvePaymentRequest(input: {
  paymentRequestId: string;
  reviewerEmail: string;
}) {
  const paymentRequest = await findPaymentRequestById(input.paymentRequestId);

  if (!paymentRequest) {
    throw new Error("Payment request tidak ditemukan.");
  }

  if (paymentRequest.status === "APPROVED") {
    return paymentRequest;
  }

  await updatePaymentRequest(paymentRequest.id, {
    status: "APPROVED",
    reviewedAt: new Date(),
    reviewedByEmail: input.reviewerEmail,
    reviewNote: null
  });

  await activateProPlan(paymentRequest.profileId);
  await clearUpgradeRequest(paymentRequest.profileId);

  return findPaymentRequestById(paymentRequest.id);
}

export async function rejectPaymentRequest(input: {
  paymentRequestId: string;
  reviewerEmail: string;
  reviewNote?: string;
}) {
  const paymentRequest = await findPaymentRequestById(input.paymentRequestId);

  if (!paymentRequest) {
    throw new Error("Payment request tidak ditemukan.");
  }

  return updatePaymentRequest(paymentRequest.id, {
    status: "REJECTED",
    reviewedAt: new Date(),
    reviewedByEmail: input.reviewerEmail,
    reviewNote: input.reviewNote || null
  });
}

export async function getBillingPaymentState(profileId: string) {
  const [pendingPayment, latestPayment] = await Promise.all([
    findPendingPaymentRequestByProfile(profileId),
    findLatestPaymentRequestByProfile(profileId)
  ]);

  return {
    pendingPayment,
    latestPayment
  };
}
