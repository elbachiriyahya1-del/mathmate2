import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-6 lg:px-8 h-20 flex items-center border-b border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-950/50 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center transition-transform hover:scale-105" href="/">
          <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            Math Mate
          </span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-semibold text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors" href="/login">
            Sign In
          </Link>
          <Link className="text-sm font-semibold bg-blue-600 text-white px-5 py-2.5 rounded-full hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all" href="/signup">
            Get Started
          </Link>
        </nav>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-32 bg-gradient-to-b from-white to-blue-50/50 dark:from-gray-950 dark:to-gray-900 border-x border-gray-100 dark:border-gray-900 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          {/* Subtle background glow effect */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-400/10 dark:bg-indigo-600/10 rounded-full blur-[100px]" />
        </div>
        
        <div className="space-y-8 max-w-4xl relative z-10">
          <h1 className="text-6xl font-extrabold tracking-tight sm:text-7xl md:text-8xl">
            <span className="block text-gray-900 dark:text-white drop-shadow-sm">Your AI-Powered</span>
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mt-2 pb-2">
              Math Companion
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
            Designed specifically for Tronc Commun students in Morocco. Master your math lessons with step-by-step guidance based directly on your teacher&apos;s PDFs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link
              href="/signup"
              className="inline-flex h-14 items-center justify-center rounded-full bg-blue-600 px-10 text-base font-bold text-white shadow-xl shadow-blue-500/30 hover:bg-blue-700 hover:scale-105 hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto"
            >
              Start Learning Now
            </Link>
            <Link
              href="/login"
              className="inline-flex h-14 items-center justify-center rounded-full border-2 border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm px-10 text-base font-bold text-gray-900 dark:text-white hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 hover:scale-105 hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto"
            >
              Teacher Login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
