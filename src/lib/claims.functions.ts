import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  insurer: z.string().min(1).max(200),
  claimType: z.string().min(1).max(200),
  description: z.string().min(1).max(4000),
  fileName: z.string().max(300).optional(),
});

export const analyzeClaim = createServerFn({ method: "POST" })
  .inputValidator((d) => Input.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY missing");

    const prompt =
      `You are Orchestra AI, an Indian health insurance claims analyst. ` +
      `Analyze the following claim submission and return a concise actionable report (max 220 words) covering:\n` +
      `1. Completeness check (likely missing fields/info based on description)\n` +
      `2. Supporting documents the user should attach (specific to the claim type & insurer)\n` +
      `3. Risk flags or things the insurer typically rejects in such cases\n` +
      `4. Next best action.\n\n` +
      `Insurer: ${data.insurer}\nClaim type: ${data.claimType}\nUploaded file: ${data.fileName || "none"}\nDescription:\n${data.description}\n\n` +
      `Format as short markdown bullets grouped by the 4 sections.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const t = await res.text();
      if (res.status === 429) throw new Error("Rate limit — please retry shortly.");
      if (res.status === 402) throw new Error("AI credits exhausted.");
      throw new Error(`AI error: ${t.slice(0, 200)}`);
    }
    const json = await res.json();
    const analysis: string = json?.choices?.[0]?.message?.content ?? "No analysis available.";
    return { analysis };
  });
