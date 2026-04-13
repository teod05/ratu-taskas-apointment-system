"use client"

import { useEffect, useState, useCallback } from "react"
import { getWeekDays, getWeekStart, toDateString, timeToMinutes } from "@/lib/calendarUtils"
import { createClient } from "@/lib/supabase/client"

import Navbar from "@/components/Navbar"
import AppointmentBlock from "@/components/AppointmentBlock"
import AppointmentDetailModal from "@/components/AppointmentDetailModal"
import CreateAppointmentModal from "@/components/CreateAppointmentModal"

interface Worker {
  id: number
  name: string
}

interface AppointmentWorker {
  worker_id: number
  worker: Worker
}

interface Appointment {
  id: string
  customer_name: string
  customer_phone: string | null
  description: string
  date: string
  start_time: string
  duration: number
  workers: AppointmentWorker[]
}

const HOUR_START = 7
const HOUR_END = 20
const TOTAL_HOURS = HOUR_END - HOUR_START
const PX_PER_HOUR = 80
const TOTAL_HEIGHT = TOTAL_HOURS * PX_PER_HOUR

const DAY_LABELS = ["Pr", "An", "Tr", "Kt", "Pn", "Št", "Sk"]

function minutesToTop(minutes: number): number {
  const offsetMins = minutes - HOUR_START * 60
  return (offsetMins / 60) * PX_PER_HOUR
}

function durationToHeight(duration: number): number {
  return (duration / 60) * PX_PER_HOUR
}

function layoutAppointments(appts: Appointment[]) {
  const sorted = [...appts].sort(
    (a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time)
  )

  type Item = { appt: Appointment; col: number; startMin: number; endMin: number }
  const items: Item[] = []
  const colEnds: number[] = []

  for (const appt of sorted) {
    const startMin = timeToMinutes(appt.start_time)
    const endMin = startMin + appt.duration

    let col = colEnds.findIndex((end) => end <= startMin)
    if (col === -1) { col = colEnds.length; colEnds.push(endMin) }
    else colEnds[col] = endMin

    items.push({ appt, col, startMin, endMin })
  }

  return items.map((item) => {
    const concurrent = items.filter(
      (o) => item.startMin < o.endMin && item.endMin > o.startMin
    )
    const totalCols = Math.max(...concurrent.map((c) => c.col)) + 1
    return { appt: item.appt, col: item.col, totalCols }
  })
}

export default function CalendarPage() {
  const [weekStart, setWeekStart] = useState<Date>(() => getWeekStart(new Date()))
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Appointment | null>(null)
  const [createModal, setCreateModal] = useState<{ date: string; startTime: string } | null>(null)

  const weekDays = getWeekDays(weekStart)
  const weekEnd = weekDays[6]

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        startDate: toDateString(weekStart),
        endDate: toDateString(weekEnd),
      })
      const res = await fetch(`/api/appointments?${params}`)
      if (!res.ok) { setAppointments([]); return }
      const data = await res.json()
      setAppointments(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }, [weekStart])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel("appointments-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Appointment" },
        () => fetchAppointments()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchAppointments])

  function appointmentsForDay(day: Date): Appointment[] {
    const key = toDateString(day)
    return appointments.filter((a) => a.date.startsWith(key))
  }

  function shiftWeek(delta: number) {
    setWeekStart((prev) => {
      const d = new Date(prev)
      d.setDate(d.getDate() + delta * 7)
      return d
    })
  }

  function goToToday() {
    setWeekStart(getWeekStart(new Date()))
  }

  function handleGridClick(day: Date, e: React.MouseEvent<HTMLDivElement>) {
    // Only fire when clicking empty space, not appointment blocks
    if ((e.target as HTMLElement).closest("[data-appointment]")) return

    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    const totalMinutes = HOUR_START * 60 + (y / PX_PER_HOUR) * 60
    // Snap to nearest 15 minutes
    const snapped = Math.round(totalMinutes / 15) * 15
    const hours = Math.floor(snapped / 60)
    const mins = snapped % 60
    const timeStr = `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`

    setCreateModal({ date: toDateString(day), startTime: timeStr })
  }

  const hourLabels = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => {
    const h = HOUR_START + i
    return `${String(h).padStart(2, "0")}:00`
  })

  const rangeLabel = `${weekStart.toLocaleDateString("lt-LT", {
    day: "numeric",
    month: "short",
  })} – ${weekEnd.toLocaleDateString("lt-LT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`

  return (
    <div className="min-h-screen bg-brand-gray">
      <Navbar />

      <main className="px-4 py-6 max-w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black text-brand-black">Savaitės kalendorius</h1>
            <p className="text-sm text-gray-500 mt-0.5">{rangeLabel}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => shiftWeek(-1)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-sm font-semibold text-brand-black transition-colors duration-150"
            >
              ← Ankst.
            </button>
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg shadow-sm text-sm font-bold transition-colors duration-150"
            >
              Šiandien
            </button>
            <button
              onClick={() => shiftWeek(1)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-sm font-semibold text-brand-black transition-colors duration-150"
            >
              Sek. →
            </button>
          </div>
        </div>

        {loading && (
          <p className="text-center text-gray-400 text-sm py-2 mb-3">Kraunama...</p>
        )}

        {/* Calendar grid */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-auto">
          {/* Day header */}
          <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-gray-100 sticky top-0 bg-white z-10">
            <div className="border-r border-gray-100" />
            {weekDays.map((day, i) => {
              const isToday = toDateString(day) === toDateString(new Date())
              return (
                <div
                  key={i}
                  className={`text-center py-3 text-xs font-bold border-r border-gray-100 last:border-r-0 uppercase tracking-wide ${
                    isToday ? "text-primary" : "text-gray-400"
                  }`}
                >
                  <div>{DAY_LABELS[i]}</div>
                  <div
                    className={`text-lg font-black mt-0.5 mx-auto w-8 h-8 flex items-center justify-center rounded-full ${
                      isToday ? "bg-primary text-white" : "text-brand-black"
                    }`}
                  >
                    {day.getDate()}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Time grid */}
          <div
            className="grid grid-cols-[56px_repeat(7,1fr)]"
            style={{ height: TOTAL_HEIGHT }}
          >
            {/* Hour labels */}
            <div className="relative border-r border-gray-100">
              {hourLabels.map((label, i) => (
                <div
                  key={label}
                  className="absolute w-full text-right pr-2 text-[10px] text-gray-700 font-medium"
                  className="absolute w-full text-right pr-2 text-[10px] text-gray-400 font-medium"
                  style={{ top: i * PX_PER_HOUR - 7 }}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day, di) => {
              const dayAppts = appointmentsForDay(day)
              const isToday = toDateString(day) === toDateString(new Date())
              return (
                <div
                  key={di}
                  className={`relative border-r border-gray-100 last:border-r-0 cursor-pointer ${
                    isToday ? "bg-red-50/30" : ""
                  }`}
                  style={{ height: TOTAL_HEIGHT }}
                  onClick={(e) => handleGridClick(day, e)}
                >
                  {/* Hour lines */}
                  {hourLabels.map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-full border-t border-gray-200"
                      style={{ top: i * PX_PER_HOUR }}
                    />
                  ))}

                  {/* Half-hour lines */}
                  {hourLabels.slice(0, -1).map((_, i) => (
                    <div
                      key={`half-${i}`}
                      className="absolute w-full border-t border-gray-100"
                      style={{ top: i * PX_PER_HOUR + PX_PER_HOUR / 2 }}
                    />
                  ))}

                  {/* Appointment blocks */}
                  {layoutAppointments(dayAppts).map(({ appt, col, totalCols }) => {
                    const startMins = timeToMinutes(appt.start_time)
                    const top = minutesToTop(startMins)
                    const height = durationToHeight(appt.duration)

                    if (startMins < HOUR_START * 60 || startMins >= HOUR_END * 60) return null

                    return (
                      <AppointmentBlock
                        key={appt.id}
                        appointment={appt}
                        topOffset={top}
                        height={height}
                        col={col}
                        totalCols={totalCols}
                        onClick={setSelected}
                      />
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>

        {/* Detail modal */}
        <AppointmentDetailModal
          appointment={selected}
          onClose={() => setSelected(null)}
          onDelete={async (id) => {
            await fetch(`/api/appointments/${id}`, { method: "DELETE" })
            setSelected(null)
            fetchAppointments()
          }}
        />

        {/* Create modal */}
        {createModal && (
          <CreateAppointmentModal
            date={createModal.date}
            startTime={createModal.startTime}
            onClose={() => setCreateModal(null)}
            onCreated={() => fetchAppointments()}
          />
        )}
      </main>
    </div>
  )
}
