# CIM AI SaaS

MVP SaaS WhatsApp AI berbasis Next.js App Router, Supabase Auth, Prisma, Fonnte, dan Gemini.

## Fitur inti

- Auth tenant dengan Supabase
- CRM contacts, conversations, dan memory
- Subscription `Free` 25 chat/hari dan `Pro` 300 chat/bulan
- Webhook Fonnte multi-tenant per user
- Trigger keyword + intent prompt untuk penawaran jasa website
- Follow-up otomatis H+1, H+3, H+5
- Admin approval untuk aktivasi paket Pro

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Supabase SSR Auth
- Prisma + PostgreSQL / Supabase Postgres
- Gemini API via REST
- Vercel Cron

## Setup lokal

1. Copy `.env.example` menjadi `.env.local`.
2. Isi env:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY`
   - `AI_PROVIDER=gemini`
   - `APP_URL`
   - `ADMIN_EMAILS`
3. Install dependency:

```bash
pnpm install
```

4. Generate Prisma client:

```bash
pnpm prisma:generate
```

5. Push schema ke database:

```bash
pnpm prisma:push
```

6. Aktifkan RLS di Supabase:

- Buka `SQL Editor` di dashboard Supabase.
- Jalankan SQL dari [supabase/enable-rls.sql](/Users/naufal/Documents/cim-ai/supabase/enable-rls.sql).
- Ini akan mengaktifkan Row Level Security untuk semua tabel app dan membuat policy `authenticated` berbasis `auth.uid()`.

7. Jalankan aplikasi:

```bash
pnpm dev
```

## Route penting

- `POST /api/webhook/fonnte/[tenantId]/[webhookKey]`
- `GET /api/subscription/status`
- `POST /api/admin/subscriptions/[userId]/activate`
- `POST /api/whatsapp/connection`
- `GET /api/contacts`
- `GET /api/conversations`
- `GET /api/cron/followups`

## Catatan implementasi

- Quota hanya bertambah saat pesan masuk benar-benar diproses AI.
- Command `/help`, `/status`, `/upgrade` tidak memotong quota.
- Attachment tanpa teks tidak diproses sebagai percakapan AI utama.
- Group chat diabaikan.
- Tenant wajib mengisi token Fonnte sendiri dan menyalin webhook URL unik dari dashboard.
