"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { db, auth } from "@/lib/firebase/config";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { Message } from "@/lib/types";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

export default function StudentChat() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && (!user || (userData && userData.role !== "student"))) {
      router.push("/");
    }
  }, [user, userData, loading, router]);

  useEffect(() => {
    const fetchConversation = async () => {
      if (!user) return;
      try {
        const convRef = doc(db, "conversations", user.uid);
        const convSnap = await getDoc(convRef);
        if (convSnap.exists()) {
          setMessages(convSnap.data().messages || []);
        } else {
          // Initialize empty conversation
          await setDoc(convRef, {
            id: user.uid,
            studentId: user.uid,
            messages: [],
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error("Error fetching conversation", err);
      }
    };
    if (user && userData?.role === "student") fetchConversation();
  }, [user, userData]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e?: React.FormEvent, appendedText?: string) => {
    e?.preventDefault();
    const textToSend = appendedText || input.trim();
    if (!textToSend || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsSending(true);

    try {
      // 1. Send to our Next.js API route
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.slice(-15), // Keep context manageable
          studentId: user.uid,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        content: data.response,
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...newMessages, aiMessage];
      setMessages(updatedMessages);

      // 2. Save back to Firestore
      const convRef = doc(db, "conversations", user.uid);
      await updateDoc(convRef, {
        messages: updatedMessages,
        updatedAt: new Date().toISOString(),
      });
      
    } catch (err) {
      console.error(err);
      // Revert if error
      setMessages(messages);
    } finally {
      setIsSending(false);
    }
  };

  const handleSignOut = () => {
    signOut(auth);
  };

  if (loading || !user || userData?.role !== "student") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm px-4 sm:px-6 h-16 flex items-center justify-between shrink-0">
        <div className="flex items-center">
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            Math Mate Chat
          </span>
        </div>
        <button 
          onClick={handleSignOut}
          className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Sign out
        </button>
      </nav>

      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4 overflow-hidden relative">
        <div className="flex-1 overflow-y-auto space-y-6 pb-36 pr-2 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">👋</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Hello, {user.email?.split('@')[0]}!</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-sm">
                I am your Math Mate. Ask me any math question, and I'll explain it using your teacher's lessons!
              </p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[89%] rounded-2xl px-5 py-3.5 shadow-sm overflow-x-auto ${
                  msg.role === "user" 
                    ? "bg-blue-600 text-white rounded-tr-none" 
                    : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-none"
                }`}>
                  {msg.role === "user" ? (
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed prose-p:my-1 prose-pre:my-2 prose-ol:my-1 prose-ul:my-1">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm, remarkMath]} 
                        rehypePlugins={[rehypeKatex]}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {isSending && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm">
                <div className="flex space-x-2 items-center h-5">
                  <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="absolute bottom-4 left-4 right-4 bg-transparent mt-4">
          {messages.length > 0 && !isSending && (
            <div className="flex gap-2 mb-3 justify-center">
              <button 
                type="button"
                onClick={() => sendMessage(undefined, "Explain this in a simpler way.")} 
                className="text-xs font-medium bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-600 px-4 py-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-all shadow-sm flex items-center gap-1.5"
                disabled={isSending}
              >
                <span>💡</span> Explain simpler
              </button>
              <button 
                type="button"
                onClick={() => sendMessage(undefined, "Give me another example of this.")} 
                className="text-xs font-medium bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-600 px-4 py-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-all shadow-sm flex items-center gap-1.5"
                disabled={isSending}
              >
                <span>📝</span> Another example
              </button>
            </div>
          )}
          <form onSubmit={(e) => sendMessage(e)} className="relative group flex items-end gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-3xl shadow-lg p-1.5 transition-shadow focus-within:shadow-xl focus-within:border-blue-400 dark:focus-within:border-blue-500">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (input.trim()) sendMessage();
                }
              }}
              placeholder="Ask a math question..."
              className="flex-1 max-h-32 min-h-[44px] bg-transparent border-none focus:ring-0 resize-none py-3 px-4 text-gray-900 dark:text-white outline-none rounded-2xl overflow-y-auto"
              rows={1}
            />
            <button
              type="submit"
              disabled={isSending || !input.trim()}
              className="bg-blue-600 text-white rounded-full p-3 h-11 w-11 flex items-center justify-center shrink-0 disabled:opacity-50 disabled:bg-gray-400 hover:bg-blue-700 transition-colors shadow-sm mb-0.5 mr-0.5"
            >
              <svg className="w-5 h-5 -ml-0.5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
