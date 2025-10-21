"use client";
import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import AddEventModal from "./AddEventModal";
import AddMealModal from "./AddMealModal";

export type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end?: string;
};

export default function CalendarView({
  events,
  onRefresh,
}: {
  events: CalendarEvent[];
  onRefresh: () => Promise<void>;
}) {
  const [selectedDate, setSelectedDate] = useState("");
  const [mealModalOpen, setMealModalOpen] = useState(false);

  const handleDateClick = (info: any) => {
    setSelectedDate(info.dateStr);
    setMealModalOpen(true);
  };

  const handleSave = async (eventData: {
    title: string;
    date: string;
    startTime?: string;
    endTime?: string;
    allDay: boolean;
  }) => {
    const { title, date, startTime, endTime, allDay } = eventData;

    const startISO = allDay
      ? date
      : new Date(`${date}T${startTime}`).toISOString();
    const endISO = allDay
      ? date
      : new Date(`${date}T${endTime || startTime}`).toISOString();

    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        start: startISO,
        end: endISO,
      }),
    });

    await onRefresh(); // ✅ 即時刷新畫面
  };
  // ✅ 點擊事件時詢問是否刪除
  const handleEventClick = async (clickInfo: any) => {
    const event = clickInfo.event;
    const details = event.extendedProps.description
      ? JSON.parse(event.extendedProps.description)
      : {};

    if (details.type === "meal") {
      const confirmEat = window.confirm(`Mark "${event.title}" as eaten?`);
      if (confirmEat) {
        await fetch("/api/events", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: event.id,
            status: "done",
          }),
        });
        await onRefresh();
      }
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl text-black font-semibold">
          🍽️ Meal Planner Calendar
        </h2>
        <button
          onClick={() => {
            setSelectedDate(new Date().toISOString().split("T")[0]); // 預設今天
            setMealModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Add Meal
        </button>
      </div>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
        }}
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        height="80vh"
      />
      <AddMealModal
        isOpen={mealModalOpen}
        onClose={() => setMealModalOpen(false)}
        selectedDate={selectedDate}
        onSave={handleSave}
      />
    </>
  );
}
