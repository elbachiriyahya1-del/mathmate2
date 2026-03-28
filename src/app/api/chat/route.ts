import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  try {
    const { messages, studentId } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    // Advanced: Building context from teacher lessons
    const lessonsSnapshot = await adminDb.collection("lessons").get();
    let knowledgeBase = "";
    lessonsSnapshot.forEach(doc => {
      knowledgeBase += `\n\n--- Lesson: ${doc.data().title} ---\n${doc.data().textContent}`;
    });

    const systemPrompt = `You are an AI math teacher called Math Mate, exclusively teaching Tronc Commun (Common Core) high school students in Morocco.
You must adhere to the following strict rules:
1. ONLY answer math-related questions. Refuse very politely, warmly and professionally if the student asks non-math questions.
2. Formulate step-by-step explanations, rather than just final answers. Teach the concept.
3. Be encouraging, patient, and use a highly supportive and engaging tone.
4. Base your explanations heavily on the provided "KNOWLEDGE BASE" (Teacher's lessons) below. Reference the lessons if relevant.
5. Provide your answers in Markdown formatting for clarity.
6. The user may trigger quick actions like "Explain this in a simpler way." or "Give me another example of this." - adapt your response immediately.

KNOWLEDGE BASE (Teacher's lessons):
${knowledgeBase ? knowledgeBase.substring(0, 30000) : "No lessons uploaded yet by the teacher."}
`;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Format messages mapping 'user' -> 'user' and 'model' -> 'model'
    const formattedContents = messages.map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    }));
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    return NextResponse.json({ response: response.text });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate AI response" }, { status: 500 });
  }
}
