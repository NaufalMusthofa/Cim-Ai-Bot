function normalizeTargetPhone(value: string) {
  return value.replace(/[^\d]/g, "");
}

export async function sendWhatsAppMessage(input: {
  token: string;
  target: string;
  message: string;
  inboxId?: string;
}) {
  const normalizedTarget = normalizeTargetPhone(input.target);

  if (!normalizedTarget) {
    throw new Error("Fonnte target phone tidak valid.");
  }

  const payload = new URLSearchParams({
    target: normalizedTarget,
    message: input.message
  });

  if (input.inboxId) {
    payload.set("inboxid", input.inboxId);
  }

  const response = await fetch("https://api.fonnte.com/send", {
    method: "POST",
    headers: {
      Authorization: input.token,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: payload.toString()
  });

  const rawBody = await response.text();

  if (!response.ok) {
    throw new Error(`Fonnte send failed: ${rawBody}`);
  }

  let responseBody: unknown = { ok: true };

  if (rawBody) {
    try {
      responseBody = JSON.parse(rawBody);
    } catch {
      responseBody = {
        ok: true,
        raw: rawBody
      };
    }
  }

  if (responseBody && typeof responseBody === "object") {
    const statusValue =
      "status" in responseBody
        ? (responseBody as { status?: unknown }).status
        : "ok" in responseBody
          ? (responseBody as { ok?: unknown }).ok
          : undefined;

    if (statusValue === false || statusValue === 0 || statusValue === "false") {
      const reason =
        "reason" in responseBody
          ? String((responseBody as { reason?: unknown }).reason || "")
          : "detail" in responseBody
            ? String((responseBody as { detail?: unknown }).detail || "")
            : "unknown_fonnte_error";
      throw new Error(`Fonnte send failed: ${reason}`);
    }
  }

  return responseBody;
}
