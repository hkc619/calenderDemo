"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

type CalendarEvent = {
  id: string;
  summary: string;
  description?: string;
  start?: { dateTime?: string };
  end?: { dateTime?: string };
};

export default function Home() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    if (session) {
      fetch("/api/events")
        .then((r) => r.json())
        .then(setEvents);
    }
  }, [session]);

  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center">
        <button
          onClick={() => signIn("google")}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">📅 To-Do Calendar</h1>
        <button
          onClick={() => signOut()}
          className="bg-gray-200 px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>

      <ul className="space-y-2">
        {events.map((e) => (
          <li
            key={e.id}
            className="border p-2 rounded hover:bg-gray-50 transition"
          >
            <div className="font-semibold">{e.summary}</div>
            <div className="text-sm text-gray-500">
              {e.start?.dateTime?.slice(0, 10)}
            </div>
          </li>
        ))}
      </ul>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const title = (form.elements.namedItem("title") as HTMLInputElement)
            .value;
          await fetch("/api/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title,
              start: new Date().toISOString(),
              end: new Date(Date.now() + 3600000).toISOString(),
            }),
          });
          form.reset();
          const newEvents = await fetch("/api/events").then((r) => r.json());
          setEvents(newEvents);
        }}
        className="mt-6 flex gap-2"
      >
        <input
          name="title"
          placeholder="New task title..."
          className="border px-2 py-1 flex-1 rounded"
          required
        />
        <button className="bg-blue-600 text-white px-3 py-1 rounded">
          Add
        </button>
      </form>
    </div>
  );
}
