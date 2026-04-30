import type { Metadata } from "next";
import "./globals.css";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${APP_NAME} SaaS`,
  description: "WhatsApp AI SaaS dengan CRM, memory, subscription, dan auto follow-up."
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{props.children}</body>
    </html>
  );
}
