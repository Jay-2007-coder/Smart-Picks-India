import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subject } = body;
    const subName = subject || "Java";

    const fallbackFlashcards = [
      {
        id: `flash-1`,
        front: `What is the primary architectural concept of ${subName}?`,
        back: `Refers to core principles, runtime execution rules, and memory specifications outlined in ${subName}.`,
        difficulty: "Medium"
      },
      {
        id: `flash-2`,
        front: `Why is active recall effective when studying ${subName}?`,
        back: "Active recall reinforces neural connections and strengthens conceptual retention.",
        difficulty: "Easy"
      },
      {
        id: `flash-3`,
        front: `How do you avoid common pitfalls in ${subName}?`,
        back: "Understand boundary cases, memory allocation limits, and syntax conventions.",
        difficulty: "Hard"
      }
    ];

    return NextResponse.json({ success: true, flashcards: fallbackFlashcards });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      flashcards: [
        { front: "Explain core principles.", back: "Key definitions and execution rules.", difficulty: "Easy" }
      ]
    });
  }
}
