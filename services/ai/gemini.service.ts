import { AI_MODEL } from "@/lib/constants";
import { hasGeminiEnv, requireEnv } from "@/lib/env";
import { evaluateKeywordTrigger } from "@/services/trigger/keyword-trigger.service";

function buildFallbackReply(message: string) {
  const triggerDecision = evaluateKeywordTrigger(message);

  if (triggerDecision.promotionSnippet) {
    return `${triggerDecision.promotionSnippet}\n\nBoleh ceritakan kebutuhan kakak lebih detail ya, biar kami bantu arahkan solusi yang paling pas.`;
  }

  return "Baik kak 😊 Boleh jelaskan kebutuhan kakak lebih detail? Nanti kami bantu arahkan solusi yang paling sesuai.";
}

export async function generateAiReply(input: {
  systemPrompt: string;
  conversation: string;
  latestMessage: string;
}) {
  if (!hasGeminiEnv()) {
    return buildFallbackReply(input.latestMessage);
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODEL}:generateContent?key=${requireEnv("GEMINI_API_KEY")}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: [
                  input.systemPrompt,
                  "",
                  `Riwayat percakapan:\n${input.conversation}`,
                  "",
                  `Pesan terbaru customer:\n${input.latestMessage}`
                ].join("\n")
              }
            ]
          }
        ]
      })
    }
  );

  if (!response.ok) {
    return buildFallbackReply(input.latestMessage);
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          text?: string;
        }>;
      };
    }>;
  };

  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();

  return text || buildFallbackReply(input.latestMessage);
}
