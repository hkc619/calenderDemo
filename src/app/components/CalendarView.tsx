"use client";
import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import AddEventModal from "./AddEventModal";

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
  const [modalOpen, setModalOpen] = useState(false);

  const handleDateClick = (info: any) => {
    setSelectedDate(info.dateStr);
    setModalOpen(true);
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
    const confirmDelete = window.confirm(
      `Delete "${event.title}" from your calendar?`
    );
    if (!confirmDelete) return;

    await fetch("/api/events", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: event.id }),
    });

    await onRefresh();
  };
  return (
    <>
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
      <AddEventModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedDate={selectedDate}
        onSave={handleSave}
      />
    </>
  );
}
