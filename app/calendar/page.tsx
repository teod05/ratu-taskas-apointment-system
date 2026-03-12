"use client"

import { useEffect, useState, useCallback } from "react"
import { getWeekDays, getWeekStart, toDateString, timeToMinutes } from "@/lib/calendarUtils"

import AppointmentBlock from "@/components/AppointmentBlock"
import AppointmentDetailModal from "@/components/AppointmentDetailModal"

interface Worker {
    id: number,
    name: string;
}

interface AppointmentWorker {
    worker_id: number,
    worker: Worker
}
interface Appointment {
    id: string,
    customer_name : string,
    customer_phone: string | null,
    description: string,
    date: string,
    start_time: string,
    duration: number,
    workers: AppointmentWorker[]
}

const HOUR_START = 7
const HOUR_END = 20
const TOTAL_HOURS = HOUR_END - HOUR_START
const PX_PER_HOUR = 80
const TOTAL_HEIGHT = TOTAL_HOURS * PX_PER_HOUR

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];


function minutesToTop(minutes: number): number {
  const offsetMins = minutes - HOUR_START * 60;
  return (offsetMins / 60) * PX_PER_HOUR;
}

function durationToHeight(duration: number): number {
    return (duration / 60) * PX_PER_HOUR
}

export default function CalendarPage() {
  const [weekStart, setWeekStart] = useState<Date>(() =>
    getWeekStart(new Date())
  )

const [appointments, setAppointments] = useState<Appointment[]>([])
const [loading, setLoading] = useState(false)
const [selected, setSelected] = useState<Appointment | null>(null);
  

const weekDays = getWeekDays(weekStart)
const weekEnd = weekDays[6]


const fetchAppointments = useCallback(async () => {
    setLoading(true)
    try{
        const params = new URLSearchParams({
            startDate: toDateString(weekStart),
            endDate: toDateString(weekEnd)
        })
        const res = await fetch(`/api/appointments?${params}`)
        const data: Appointment[] = await res.json()
        setAppointments(data)
    } finally {
        setLoading(false)
    }
}, [weekStart])

useEffect(()=> {
    fetchAppointments()
}, [fetchAppointments])

  function appointmentsForDay(day: Date): Appointment[] {
    const key = toDateString(day);
    return appointments.filter((a) => {
      return a.date.startsWith(key);
    });
  }

  function shiftWeek(delta: number) {
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + delta * 7);
      return d;
    });
  }

function goToToday(){
    setWeekStart(getWeekStart(new Date()))
}

function apoointmentsForDAy(day: Date): Appointment[]{
    const key = toDateString(day)
    return appointments.filter((a) => {
        return a.date.startsWith(key)
    })
}

  const hourLabels = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => {
    const h = HOUR_START + i;
    return `${String(h).padStart(2, "0")}:00`;
  });
const rangeLabel = `${weekStart.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short"
})} - ${weekEnd.toLocaleDateString("en-GB", {
    day: "numeric",
    month : "short",
    year: "numeric"
})}`

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-gray-800">📅 Weekly Calendar</h1>

        <div className="flex items-center gap-2">
          <button
            onClick={() => shiftWeek(-1)}
            className="px-3 py-1.5 bg-white border rounded-lg shadow-sm hover:bg-gray-100 text-sm font-medium"
          >
            ← Prev
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 text-sm font-medium"
          >
            Today
          </button>
          <button
            onClick={() => shiftWeek(1)}
            className="px-3 py-1.5 bg-white border rounded-lg shadow-sm hover:bg-gray-100 text-sm font-medium"
          >
            Next →
          </button>
        </div>

        <p className="text-gray-600 font-medium text-sm w-full sm:w-auto text-center">
          {rangeLabel}
        </p>
      </div>

      {loading && (
        <p className="text-center text-gray-500 py-4">Loading appointments…</p>
      )}

      {/* ── Calendar Grid ── */}
      <div className="bg-white rounded-xl shadow overflow-auto">
        {/* Day header row */}
        <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b sticky top-0 bg-white z-10">
          <div className="border-r" /> {/* time gutter */}
          {weekDays.map((day, i) => {
            const isToday = toDateString(day) === toDateString(new Date());
            return (
              <div
                key={i}
                className={`text-center py-2 text-sm font-semibold border-r last:border-r-0 ${
                  isToday ? "bg-blue-50 text-blue-700" : "text-gray-700"
                }`}
              >
                <div>{DAY_LABELS[i]}</div>
                <div
                  className={`text-lg font-bold ${
                    isToday
                      ? "bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto"
                      : ""
                  }`}
                >
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time grid body */}
        <div
          className="grid grid-cols-[60px_repeat(7,1fr)]"
          style={{ height: TOTAL_HEIGHT }}
        >
          {/* Hour labels column */}
          <div className="relative border-r">
            {hourLabels.map((label, i) => (
              <div
                key={label}
                className="absolute w-full text-right pr-2 text-xs text-gray-400"
                style={{ top: i * PX_PER_HOUR - 8 }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day, di) => {
            const dayAppts = appointmentsForDay(day);
            return (
              <div
                key={di}
                className="relative border-r last:border-r-0"
                style={{ height: TOTAL_HEIGHT }}
              >
                {/* Hour lines */}
                {hourLabels.map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-full border-t border-gray-100"
                    style={{ top: i * PX_PER_HOUR }}
                  />
                ))}

                {/* Half-hour lines */}
                {hourLabels.slice(0, -1).map((_, i) => (
                  <div
                    key={`half-${i}`}
                    className="absolute w-full border-t border-gray-50"
                    style={{ top: i * PX_PER_HOUR + PX_PER_HOUR / 2 }}
                  />
                ))}

                {/* Appointment blocks */}
                {dayAppts.map((appt) => {
                  const startMins = timeToMinutes(appt.start_time);
                  const top = minutesToTop(startMins);
                  const height = durationToHeight(appt.duration);

                  // Skip if outside visible range
                  if (
                    startMins < HOUR_START * 60 ||
                    startMins >= HOUR_END * 60
                  ) {
                    return null;
                  }

                  return (
                    <AppointmentBlock
                      key={appt.id}
                      appointment={appt}
                      topOffset={top}
                      height={height}
                      onClick={setSelected}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Detail Modal ── */}
      <AppointmentDetailModal
        appointment={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
