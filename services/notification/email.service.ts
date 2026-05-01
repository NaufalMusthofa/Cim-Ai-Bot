import nodemailer from "nodemailer";
import { getSmtpConfig } from "@/lib/env";

export async function sendEmailNotification(input: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  const smtp = getSmtpConfig();

  if (!input.to) {
    return {
      ok: false as const,
      reason: "missing_recipient_email"
    };
  }

  if (!smtp.isConfigured) {
    return {
      ok: false as const,
      reason: "missing_smtp_env"
    };
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: smtp.user,
      pass: smtp.pass
    }
  });

  await transporter.sendMail({
    from: smtp.from,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html
  });

  return {
    ok: true as const,
    reason: ""
  };
}
