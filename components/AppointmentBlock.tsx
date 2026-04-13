"use client"

import { timeToMinutes, minutesToLabel } from "@/lib/calendarUtils"

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

interface Props {
  appointment: Appointment
  topOffset: number
  height: number
  col: number
  totalCols: number
  onClick: (a: Appointment) => void
}

export default function AppointmentBlock({
  appointment,
  topOffset,
  height,
  col,
  totalCols,
  onClick,
}: Props) {
  const startMins = timeToMinutes(appointment.start_time)
  const endMins = startMins + appointment.duration
  const workerNames = appointment.workers.map((w) => w.worker.name).join(", ")

  const widthPct = 100 / totalCols
  const leftPct = col * widthPct

  return (
    <div
      data-appointment
      className="absolute bg-primary hover:bg-primary-dark text-white rounded-lg px-2 py-1 text-xs cursor-pointer overflow-hidden shadow-sm transition-colors duration-150"
      style={{
        top: topOffset,
        height: Math.max(height, 24),
        left: `calc(${leftPct}% + 2px)`,
        width: `calc(${widthPct}% - 4px)`,
      }}
      onClick={() => onClick(appointment)}
      title={`${appointment.customer_name} — ${minutesToLabel(startMins)} iki ${minutesToLabel(endMins)}`}
    >
      <p className="font-bold truncate leading-tight">{appointment.customer_name}</p>
      <p className="truncate opacity-80 leading-tight">{appointment.description}</p>
      {workerNames && (
        <p className="truncate opacity-60 leading-tight">{workerNames}</p>
      )}
    </div>
  )
}
