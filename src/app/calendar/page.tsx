"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CalendarView, { CalendarEvent } from "../components/CalendarView";

export default function Home() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const router = useRouter();

  const loadEvents = async () => {
    const res = await fetch("/api/events");
    const data: CalendarEvent[] = await res.json();
    setEvents(data);
  };

  const logout = () => {
    signOut();
    router.push("/");
  };

  useEffect(() => {
    const load = async () => {
      const r = await fetch("/api/events");
      if (!r.ok) return;
      const data: CalendarEvent[] = await r.json();
      setEvents(data);
    };
    if (session) loadEvents();
  }, [session]);

  if (!session)
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-bold">🗓️ To-Do Calendar</h1>
        <button
          onClick={() => signIn("google")}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Sign in with Google
        </button>
      </div>
    );

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📅 To-Do Calendar</h1>
        <button
          onClick={() => logout()}
          className="bg-blue-600 px-3 py-1 rounded hover:bg-gray-600"
        >
          Logout
        </button>
      </div>

      <CalendarView
        events={events}
        onDateClick={async ({ dateStr }) => {
          const title = window.prompt("Enter new task title:");
          if (!title) return;

          const r = await fetch("/api/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, start: dateStr, end: dateStr }),
          });
          if (!r.ok) return;

          const newEvent: CalendarEvent = await r.json();
          setEvents((prev) => [...prev, newEvent]);
        }}
      />
    </div>
  );
}
