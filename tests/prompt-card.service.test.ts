import { describe, expect, it } from "vitest";
import { renderPromptTemplate } from "@/services/ai/prompt-card.service";

describe("prompt-card.service", () => {
  it("renders placeholders and cleans empty lines", () => {
    const rendered = renderPromptTemplate("{{promotionSnippet}}\n\nHalo {{name}}", {
      promotionSnippet: "",
      name: "Naufal"
    });

    expect(rendered).toBe("Halo Naufal");
  });
});
