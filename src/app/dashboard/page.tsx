"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { db, auth } from "@/lib/firebase/config";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Lesson } from "@/lib/types";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";

export default function TeacherDashboard() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && (!user || (userData && userData.role !== "teacher"))) {
      router.push("/");
    }
  }, [user, userData, loading, router]);

  const fetchLessons = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, "lessons"), where("teacherId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const fetchedLessons: Lesson[] = [];
      querySnapshot.forEach((docSnap) => {
        fetchedLessons.push(docSnap.data() as Lesson);
      });
      // Sort by creation date
      fetchedLessons.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setLessons(fetchedLessons);
    } catch (err) {
      console.error("Error fetching lessons:", err);
    }
  };

  useEffect(() => {
    if (user && userData?.role === "teacher") {
      fetchLessons();
    }
  }, [user, userData]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !user) return;

    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("teacherId", user.uid);

      const response = await fetch("/api/extract-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setFile(null);
      setTitle("");
      // Refresh lesson list
      fetchLessons();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (lessonId: string) => {
    if (confirm("Are you sure you want to delete this lesson?")) {
      try {
        await deleteDoc(doc(db, "lessons", lessonId));
        setLessons(lessons.filter(l => l.id !== lessonId));
      } catch (err) {
        console.error("Error deleting lesson", err);
      }
    }
  };

  const handleSignOut = () => {
    signOut(auth);
  };

  if (loading || !user || userData?.role !== "teacher") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-10 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            Teacher Dashboard
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
            {user.email}
          </span>
          <button 
            onClick={handleSignOut}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Upload Column */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Upload New Lesson</h2>
            
            {error && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Lesson Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none"
                  placeholder="e.g. Equations of second degree"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Lesson PDF
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600 dark:text-gray-300">
                      <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus-within:outline-none">
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PDF up to 10MB
                    </p>
                  </div>
                </div>
                {file && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 break-all">
                    Selected: {file.name}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={uploading || !file || !title}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2 py-2.5 rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  "Upload & Process"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Lessons List Column */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Your Lessons</h2>
            
            {lessons.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-200">No lessons uploaded</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by uploading your first PDF lesson.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {lessons.map((lesson) => (
                  <div key={lesson.id} className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all">
                    <div className="flex justify-between items-start">
                      <div className="pr-8">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate" title={lesson.title}>{lesson.title}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate" title={lesson.fileName}>{lesson.fileName}</p>
                      </div>
                      <button
                        onClick={() => handleDelete(lesson.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete lesson"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {new Date(lesson.createdAt).toLocaleDateString()}
                      </span>
                      {lesson.pdfUrl ? (
                        <a 
                          href={lesson.pdfUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1"
                        >
                          View PDF
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ) : (
                        <span className="text-xs font-medium text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-md">
                          Text Processed ✓
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
