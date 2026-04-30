import type { InboundWebhookPayload } from "@/types/domain";

function parseTimestamp(value: unknown) {
  if (typeof value === "number") {
    return new Date(value > 9999999999 ? value : value * 1000);
  }

  if (typeof value === "string" && value) {
    const numeric = Number(value);
    if (!Number.isNaN(numeric)) {
      return new Date(numeric > 9999999999 ? numeric : numeric * 1000);
    }

    const asDate = new Date(value);
    if (!Number.isNaN(asDate.getTime())) {
      return asDate;
    }
  }

  return new Date();
}

function normalizeBoolean(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return ["true", "1", "yes"].includes(value.toLowerCase());
  }

  return false;
}

function normalizeStringRecord(data: FormData | URLSearchParams) {
  const result: Record<string, string> = {};
  for (const [key, value] of data.entries()) {
    result[key] = typeof value === "string" ? value : value.name;
  }
  return result;
}

export async function parseFonntePayload(request: Request): Promise<InboundWebhookPayload> {
  const contentType = request.headers.get("content-type") || "";
  let raw: Record<string, unknown> = {};

  if (contentType.includes("application/json")) {
    raw = (await request.json()) as Record<string, unknown>;
  } else if (contentType.includes("form")) {
    raw = normalizeStringRecord(await request.formData());
  } else {
    const body = await request.text();
    raw = Object.fromEntries(new URLSearchParams(body).entries());
  }

  const sender = String(raw.sender ?? raw.number ?? raw.from ?? "");
  const message = String(raw.message ?? raw.text ?? raw.body ?? raw.caption ?? "").trim();
  const isGroup = normalizeBoolean(raw.isGroup) || sender.includes("@g.us");
  const rawTimestamp = raw.timestamp ?? raw.date ?? Date.now();
  const timestamp = parseTimestamp(rawTimestamp);
  const eventId =
    typeof raw.id === "string" && raw.id
      ? raw.id
      : [
          sender,
          String(
            typeof rawTimestamp === "number" || typeof rawTimestamp === "string"
              ? rawTimestamp
              : timestamp.getTime()
          ),
          message || "[empty-message]",
          typeof raw.inboxid === "string" ? raw.inboxid : "no-inbox"
        ].join(":");

  return {
    eventId,
    sender,
    senderName: typeof raw.name === "string" ? raw.name : typeof raw.senderName === "string" ? raw.senderName : undefined,
    message,
    timestamp,
    inboxId: typeof raw.inboxid === "string" ? raw.inboxid : undefined,
    isGroup,
    attachment:
      raw.url || raw.filename || raw.mimetype
        ? {
            url: typeof raw.url === "string" ? raw.url : undefined,
            filename: typeof raw.filename === "string" ? raw.filename : undefined,
            mimetype: typeof raw.mimetype === "string" ? raw.mimetype : undefined
          }
        : null,
    raw
  };
}
