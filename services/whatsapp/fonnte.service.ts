export async function sendWhatsAppMessage(input: {
  token: string;
  target: string;
  message: string;
  inboxId?: string;
}) {
  const payload = new URLSearchParams({
    target: input.target,
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

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Fonnte send failed: ${body}`);
  }

  return response.json().catch(() => ({ ok: true }));
}
