"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";

export type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end?: string;
};

type DateClickArg = {
  dateStr: string;
};

type EventClickArg = {
  event: { id: string; title: string; startStr: string; endStr: string };
};

export default function CalendarView({
  events,
  onDateClick,
  onEventClick,
}: {
  events: CalendarEvent[];
  onDateClick?: (arg: DateClickArg) => void;
  onEventClick?: (arg: EventClickArg) => void;
}) {
  return (
    <div className="w-full max-w-5xl mx-auto bg-white shadow-md rounded-lg p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={events}
        dateClick={onDateClick}
        eventClick={onEventClick}
        height="80vh"
      />
    </div>
  );
}
