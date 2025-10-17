"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleStart = () => {
    if (session) router.push("/calendar");
    else signIn("google");
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white text-center px-6">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-700 mb-4">
        Smart To-Do Calendar
      </h1>
      <p className="text-gray-600 max-w-xl mb-8">
        A simple yet powerful tool to manage your schedule and tasks, integrated
        seamlessly with Google Calendar.
      </p>

      <button
        onClick={handleStart}
        className="px-6 py-3 text-lg font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
      >
        Get Started →
      </button>

      <footer className="absolute bottom-4 text-sm text-gray-400">
        © {new Date().getFullYear()} Kyle’s Calender App
      </footer>
    </main>
  );
}
