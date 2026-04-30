import { describe, expect, it } from "vitest";
import { parseFonntePayload } from "@/services/webhook/fonnte-payload";

describe("fonnte-payload parser", () => {
  it("parses json payload into normalized webhook shape", async () => {
    const request = new Request("http://localhost", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        id: "evt-1",
        sender: "62812345",
        name: "Naufal",
        message: "Saya butuh website",
        timestamp: 1_777_777_777
      })
    });

    const payload = await parseFonntePayload(request);

    expect(payload.eventId).toBe("evt-1");
    expect(payload.sender).toBe("62812345");
    expect(payload.senderName).toBe("Naufal");
    expect(payload.message).toBe("Saya butuh website");
    expect(payload.isGroup).toBe(false);
  });

  it("marks group payloads correctly", async () => {
    const request = new Request("http://localhost", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded"
      },
      body: "sender=120363@g.us&message=halo&timestamp=1777777777"
    });

    const payload = await parseFonntePayload(request);

    expect(payload.isGroup).toBe(true);
  });
});
