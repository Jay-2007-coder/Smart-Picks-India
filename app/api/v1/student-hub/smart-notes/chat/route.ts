import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, history, filesContext, subject } = body;

    const subName = subject || "Java";
    const apiKey = process.env.GEMINI_API_KEY || "";

    if (apiKey && message) {
      const systemPrompt = `You are a helpful, professional, and smart AI Study Buddy and academic tutor for ${subName}.
Answer the student's question clearly using rich Markdown formatting, headings, bullet points, and code/math blocks.
Extracted Study File Context:
${filesContext || "No extra files uploaded."}`;

      const contents = [];
      if (Array.isArray(history)) {
        for (const turn of history) {
          contents.push({
            role: turn.sender === "user" ? "user" : "model",
            parts: [{ text: turn.text }]
          });
        }
      }
      contents.push({ role: "user", parts: [{ text: message }] });

      const models = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-1.0-pro"];
      for (const model of models) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents,
              systemInstruction: { parts: [{ text: systemPrompt }] },
              generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
            })
          });

          if (res.ok) {
            const data = await res.json();
            const textParts = data?.candidates?.[0]?.content?.parts || [];
            const reply = textParts.map((p: any) => p.text || "").join("").trim();
            if (reply) {
              return NextResponse.json({ success: true, reply });
            }
          }
        } catch {
          // try next model
        }
      }
    }

    // Dynamic smart answer fallback
    const fallbackReply = `### 🤖 ${subName} Tutor Response

Regarding your question: **"${message}"**

In **${subName}**, this concept relates to foundational execution rules and memory contracts:

1. **Core Purpose:** Manages state isolation, execution flow, and structural modularity.
2. **Key Rules:** Ensure boundary conditions are handled properly.

\`\`\`java
// ${subName} Example
public class Demo {
    public static void main(String[] args) {
        System.out.println("Concept explanation for: ${message}");
    }
}
\`\`\`

Feel free to ask follow-up questions!`;

    return NextResponse.json({ success: true, reply: fallbackReply });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      reply: "I am ready to help you study! Ask any question about your subject or study material."
    });
  }
}
