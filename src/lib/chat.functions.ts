import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Msg = z.object({ role: z.enum(["user", "assistant", "system"]), content: z.string().min(1).max(4000) });
const Input = z.object({ messages: z.array(Msg).min(1).max(40) });

export const chatWithAI = createServerFn({ method: "POST" })
  .inputValidator((d) => Input.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY missing");

    const system = {
      role: "system" as const,
      content:
        "You are Orchestra AI, a friendly financial assistant for the Orchestra Smart Spending app. " +
        "Help users with payment optimization (best card recommendations), splitting bills, subscription leak detection, " +
        "and health insurance claims. Keep answers concise (2-4 sentences), warm, and actionable. " +
        "Use Indian context: ₹ rupees, UPI, RBI, common Indian banks (HDFC, ICICI, SBI, Axis).",
    };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [system, ...data.messages],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      if (res.status === 429) throw new Error("Rate limit — please retry in a moment.");
      if (res.status === 402) throw new Error("AI credits exhausted. Add credits in Workspace settings.");
      throw new Error(`AI error: ${text.slice(0, 200)}`);
    }
    const json = await res.json();
    const reply: string = json?.choices?.[0]?.message?.content ?? "Sorry, I couldn't respond.";
    return { reply };
  });
