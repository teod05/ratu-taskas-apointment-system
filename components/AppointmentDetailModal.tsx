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
  appointment: Appointment | null
  onClose: () => void
  onDelete?: (id: string) => void
}

export default function AppointmentDetailModal({ appointment, onClose, onDelete }: Props) {
  if (!appointment) return null

  const startMins = timeToMinutes(appointment.start_time)
  const endMins = startMins + appointment.duration
  const workerNames = appointment.workers.map((w) => w.worker.name).join(", ")

  const rows: { label: string; value: string | null }[] = [
    { label: "Klientas", value: appointment.customer_name },
    { label: "Telefonas", value: appointment.customer_phone },
    { label: "Aprašymas", value: appointment.description },
    {
      label: "Laikas",
      value: `${minutesToLabel(startMins)} – ${minutesToLabel(endMins)} (${appointment.duration} min)`,
    },
    { label: "Darbuotojai", value: workerNames || null },
  ]

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Red top bar */}
        <div className="h-1.5 bg-primary" />

        <div className="p-6">
          <div className="flex items-start justify-between mb-5">
            <h2 className="text-lg font-black text-brand-black">Vizito informacija</h2>
            <button
              onClick={onClose}
              className="text-gray-300 hover:text-gray-500 transition-colors duration-150 text-xl leading-none"
              aria-label="Uždaryti"
            >
              &times;
            </button>
          </div>

          <dl className="space-y-3">
            {rows.map(
              ({ label, value }) =>
                value && (
                  <div key={label} className="flex gap-3">
                    <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-28 shrink-0 pt-0.5">
                      {label}
                    </dt>
                    <dd className="text-sm font-medium text-brand-black">{value}</dd>
                  </div>
                )
            )}
          </dl>

          <div className="mt-6 flex gap-3">
            {onDelete && (
              <button
                className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl py-2.5 text-sm font-bold transition-colors duration-150"
                onClick={() => {
                  if (window.confirm("Ar tikrai norite ištrinti šį vizitą?")) {
                    onDelete(appointment.id)
                  }
                }}
              >
                Ištrinti
              </button>
            )}
            <button
              className="flex-1 bg-brand-gray hover:bg-gray-200 text-brand-black rounded-xl py-2.5 text-sm font-bold transition-colors duration-150"
              onClick={onClose}
            >
              Uždaryti
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
