import { afterEach, describe, expect, it, vi } from "vitest";
import { sendWhatsAppMessage } from "@/services/whatsapp/fonnte.service";

describe("fonnte.service", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("normalizes target phone before sending to Fonnte", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: true }), {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      })
    );

    vi.stubGlobal("fetch", fetchMock);

    await sendWhatsAppMessage({
      token: "token-test",
      target: "+62 812-3456-7890",
      message: "halo"
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      method: "POST",
      headers: {
        Authorization: "token-test",
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });
    expect(String(fetchMock.mock.calls[0]?.[1]?.body)).toContain("target=6281234567890");
  });

  it("throws when Fonnte returns success HTTP but failed JSON status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ status: false, reason: "device offline" }), {
          status: 200,
          headers: {
            "Content-Type": "application/json"
          }
        })
      )
    );

    await expect(
      sendWhatsAppMessage({
        token: "token-test",
        target: "6281234567890",
        message: "halo"
      })
    ).rejects.toThrow("device offline");
  });
});
