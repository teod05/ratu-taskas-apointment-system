
"use client"

import { timeToMinutes, minutesToLabel } from "@/lib/calendarUtils";

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

interface Props {
    appointment: Appointment
    topOffset: number
    height: number
    onClick: (a : Appointment) => void
}

export default function AppointmentBlock({
    appointment,
    topOffset,
    height,
    onClick,
}: Props) {
    const startMins = timeToMinutes(appointment.start_time)
    const endMins = startMins + appointment.duration
    const workerNames = appointment.workers.map((w) => w.worker.id).join(", ")

  return (
    <div
      className="absolute left-1 right-1 bg-blue-500 text-white rounded-md px-2 py-1 text-xs cursor-pointer hover:bg-blue-600 overflow-hidden shadow"
      style={{ top: topOffset, height: Math.max(height, 24) }}
      onClick={() => onClick(appointment)}
      title={`${appointment.customer_name} — ${minutesToLabel(startMins)} to ${minutesToLabel(endMins)}`}
    >
      <p className="font-semibold truncate">{appointment.customer_name}</p>
      <p className="truncate opacity-90">{appointment.description}</p>
      {workerNames && (
        <p className="truncate opacity-75">👷 {workerNames}</p>
      )}
    </div>
  );
}
