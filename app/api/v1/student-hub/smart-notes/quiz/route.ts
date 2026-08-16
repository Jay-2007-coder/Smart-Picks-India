import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subject } = body;
    const sub = subject || "Java";

    const quizQuestions = [
      {
        id: `q-1`,
        type: "MCQ",
        question: `In ${sub}, which keyword enables a subclass to inherit fields and methods from a superclass?`,
        options: ["implements", "extends", "inherits", "super"],
        answer: "extends",
        explanation: "The 'extends' keyword establishes class inheritance in Java."
      },
      {
        id: `q-2`,
        type: "TrueFalse",
        question: `Constructors in ${sub} can be marked as static or final.`,
        options: ["True", "False"],
        answer: "False",
        explanation: "Constructors belong to object instantiation and cannot be marked static or final."
      },
      {
        id: `q-3`,
        type: "FillBlank",
        question: `Multiple class inheritance is prevented in ${sub} to avoid the ________ Problem.`,
        options: [],
        answer: "Diamond",
        explanation: "The Diamond Problem occurs when two superclasses define identical method signatures."
      },
      {
        id: `q-4`,
        type: "MCQ",
        question: `Which memory structure stores active method call frames and local primitive variables?`,
        options: ["Call Stack", "Heap Memory", "Garbage Collector", "Method Area"],
        answer: "Call Stack",
        explanation: "The Call Stack manages function execution frames and primitive local variables."
      }
    ];

    return NextResponse.json({ success: true, quiz: quizQuestions });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      quiz: [
        {
          id: "q-1",
          type: "TrueFalse",
          question: "Active recall boosts exam score.",
          options: ["True", "False"],
          answer: "True",
          explanation: "Testing strengthens retention."
        }
      ]
    });
  }
}
