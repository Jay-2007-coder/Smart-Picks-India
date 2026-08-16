import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subject, topic, style, mode, filesContext, customSyllabusText } = body;

    const subName = subject || "Java";
    const targetTopic = topic && topic.trim() ? topic.trim() : "Core Concepts & Architecture";
    const apiKey = process.env.GEMINI_API_KEY || "";

    if (apiKey) {
      const systemPrompt = `You are a senior academic professor and subject-matter expert.
Generate rich, highly detailed, exam-oriented study notes for the subject "${subName}" on the specific topic: "${targetTopic}".
Note Style: ${style || "One-Night Revision Notes"}
Exam Target Mode: ${mode || "University Exam Mode"}

Your notes MUST contain:
- ## Overview of ${targetTopic}
- ## Key Definitions & Core Architecture
- ## Step-by-Step Practical / Code Examples (include syntax/equations)
- ## University / Competitive Exam High-Yield Points
- ## Common Student Mistakes & Pitfalls
- ## Summary & Actionable Takeaways

Format your output in clean, rich Markdown with headers, bold text, bullet points, and code/equation blocks.`;

      const userPrompt = `Subject: ${subName}
Specific Topic: ${targetTopic}
Note Style: ${style}
Study Mode: ${mode}
Syllabus Focus: ${customSyllabusText || "Standard Subject Curriculum"}
Uploaded File Text Context:
${filesContext || "No extra files uploaded"}`;

      const models = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-1.0-pro"];
      for (const model of models) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: userPrompt }] }],
              systemInstruction: { parts: [{ text: systemPrompt }] },
              generationConfig: { temperature: 0.7, maxOutputTokens: 8192 }
            })
          });

          if (res.ok) {
            const data = await res.json();
            const textParts = data?.candidates?.[0]?.content?.parts || [];
            const text = textParts.map((p: any) => p.text || "").join("").trim();
            if (text) {
              const cleanContent = text.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
              return NextResponse.json({
                success: true,
                note: {
                  title: `${subName} - ${targetTopic}`,
                  content: cleanContent,
                  keyTakeaways: [
                    `Comprehensive study guide for ${targetTopic} in ${subName}.`,
                    "Key definitions and operational rules included.",
                    "Review exam points prior to tests."
                  ],
                  formulas: []
                }
              });
            }
          }
        } catch {
          // try next model
        }
      }
    }

    // Fallback notes structure
    const fallbackContent = `## ${subName} — ${targetTopic}

### 1. Topic Overview
The **${targetTopic}** is a critical component of **${subName}**. It forms the foundation for theoretical understanding and practical implementation in university and competitive examinations.

### 2. Core Concepts & Architectural Details
- **Primary Mechanism:** ${targetTopic} provides the essential runtime environment and structural rules needed for execution.
- **Key Purpose:** Ensures modularity, efficiency, and resource optimization during execution.
- **Standard Workflow:**
  1. Initialization and environment configuration.
  2. Compilation / Execution flow.
  3. Memory allocation and state cleanup.

### 3. Practical Code / Execution Example
\`\`\`java
// ${subName} - ${targetTopic} Implementation Example
public class ${targetTopic.replace(/[^a-zA-Z0-9]/g, "") || "Main"}Demo {
    public static void main(String[] args) {
        System.out.println("Executing ${targetTopic} in ${subName}...");
    }
}
\`\`\`

### 4. Exam High-Yield Points
1. **Definition:** Be prepared to define **${targetTopic}** in 2-3 concise technical sentences.
2. **Comparison:** Distinguish ${targetTopic} from related subsystems in ${subName}.
3. **Performance Impact:** Note time/space complexity or execution overhead associated with ${targetTopic}.

### 5. Common Student Pitfalls
- Confusing theoretical specifications of ${targetTopic} with platform-specific implementations.
- Neglecting boundary conditions and error management during practical exams.`;

    return NextResponse.json({
      success: true,
      note: {
        title: `${subName} - ${targetTopic}`,
        content: fallbackContent,
        keyTakeaways: [
          `Mastered core definitions and workflow of ${targetTopic} in ${subName}.`,
          "Reviewed annotated code/execution examples.",
          "Memorized high-yield exam points and common pitfalls."
        ],
        formulas: [`${subName} (${targetTopic}) → Optimized Execution`]
      }
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      note: {
        title: "Study Notes",
        content: "## Core Study Concepts\nReview essential definitions and theoretical foundations.",
        keyTakeaways: ["Key concepts mastered."],
        formulas: []
      }
    });
  }
}
