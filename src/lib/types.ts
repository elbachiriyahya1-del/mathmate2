export interface UserData {
  uid: string;
  email: string | null;
  role: "teacher" | "student" | null;
  createdAt: string;
}

export interface Lesson {
  id: string;
  teacherId: string;
  title: string;
  textContent: string;
  pdfUrl?: string;
  fileName: string;
  createdAt: string;
}

export interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  studentId: string;
  title: string;
  messages: Message[];
  updatedAt: string;
}
