import React from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

export default function CalendarView({ shifts, onSelectDate }) {
  const eventStyleGetter = () => ({
    style: {
      backgroundColor: "#90cdf4",
      borderRadius: "6px",
      color: "#1a202c",
      border: "none",
      fontSize: "0.85rem",
      padding: "2px 4px",
    },
  });

  const dayPropGetter = (date) => {
    const hasShift = shifts.some(
      (s) => moment(s.start).format("YYYY-MM-DD") === moment(date).format("YYYY-MM-DD")
    );
    if (hasShift) return { style: { backgroundColor: "#ebf8ff" } };
    return {};
  };

  return (
    <div className="calendar-card">
      <Calendar
        localizer={localizer}
        events={shifts}
        startAccessor="start"
        endAccessor="end"
        selectable
        views={["month"]}
        style={{ height: "70vh", padding: "15px" }}
        onSelectSlot={(slotInfo) => onSelectDate(slotInfo.start)}
        onSelectEvent={(event) => onSelectDate(event.start)}
        eventPropGetter={eventStyleGetter}
        dayPropGetter={dayPropGetter}
      />
    </div>
  );
}
