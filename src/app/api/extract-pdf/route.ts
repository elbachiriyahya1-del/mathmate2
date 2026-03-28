import { NextResponse } from "next/server";
import { adminDb, adminStorage } from "@/lib/firebase/admin";
import crypto from "crypto";

const pdf = require("pdf-parse");

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string;
    const teacherId = formData.get("teacherId") as string;

    if (!file || !title || !teacherId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Convert file to buffer for pdf-parse and storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Extract text from PDF
    const pdfData = await pdf(buffer);
    const extractedText = pdfData.text;

    // 2. SKIPPED STORAGE UPLOAD
    // The user bypassed Firebase Storage creation, so we won't upload the actual PDF file for now.
    const pdfUrl = "";

    // 3. Save Lesson Record to Firestore
    const lessonId = crypto.randomUUID();
    const lessonRef = adminDb.collection("lessons").doc(lessonId);
    
    const lessonData = {
      id: lessonId,
      teacherId,
      title,
      textContent: extractedText,
      pdfUrl,
      fileName: file.name,
      createdAt: new Date().toISOString()
    };
    
    await lessonRef.set(lessonData);

    return NextResponse.json({ success: true, lesson: lessonData });

  } catch (error: any) {
    console.error("PDF Extraction Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process PDF" }, { status: 500 });
  }
}
