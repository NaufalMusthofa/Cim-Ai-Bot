export function getAppUrl() {
  return process.env.APP_URL?.replace(/\/$/, "") || "http://localhost:3000";
}

export function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function getDefaultFonnteNumber() {
  return process.env.DEFAULT_FONNTE_NUMBER?.trim() || "";
}

export function getDefaultFonnteToken() {
  return process.env.DEFAULT_FONNTE_TOKEN?.trim() || "";
}

export function getAdminNotificationPhone() {
  return process.env.ADMIN_NOTIFICATION_PHONE?.trim() || "";
}

export function getAdminNotificationEmail() {
  return process.env.ADMIN_NOTIFICATION_EMAIL?.trim() || "";
}

export function getAdminNotifierToken() {
  return process.env.ADMIN_NOTIFIER_FONNTE_TOKEN?.trim() || getDefaultFonnteToken();
}

export function getPaymentProofBucket() {
  return process.env.SUPABASE_PAYMENT_PROOF_BUCKET?.trim() || "payment-proofs";
}

export function getSmtpConfig() {
  const host = process.env.SMTP_HOST?.trim() || (process.env.SMTP_USER?.includes("@gmail.com") ? "smtp.gmail.com" : "");
  const portRaw = process.env.SMTP_PORT?.trim();
  const secureRaw = process.env.SMTP_SECURE?.trim().toLowerCase();
  const user = process.env.SMTP_USER?.trim() || "";
  const pass = process.env.SMTP_PASS?.trim() || "";
  const from = process.env.SMTP_FROM?.trim() || user;
  const port = portRaw ? Number(portRaw) : host === "smtp.gmail.com" ? 465 : 587;
  const secure = secureRaw ? secureRaw === "true" || secureRaw === "1" : port === 465;

  return {
    host,
    port,
    secure,
    user,
    pass,
    from,
    isConfigured: Boolean(host && port && user && pass && from)
  };
}

export function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

export function hasGeminiEnv() {
  return process.env.AI_PROVIDER === "gemini" && Boolean(process.env.GEMINI_API_KEY);
}
