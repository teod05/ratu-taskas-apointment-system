"use client"

import { useState, useEffect, FormEvent } from "react"

interface Worker {
  id: number
  name: string
}

interface Props {
  date: string       // "YYYY-MM-DD"
  startTime: string  // "HH:MM"
  onClose: () => void
  onCreated: () => void
}

export default function CreateAppointmentModal({ date, startTime, onClose, onCreated }: Props) {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [description, setDescription] = useState("")
  const [time, setTime] = useState(startTime)
  const [duration, setDuration] = useState(30)
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<number[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/workers")
      .then((res) => res.json())
      .then((data) => setWorkers(data))
      .catch(() => {})
  }, [])

  function toggleWorker(id: number) {
    setSelectedWorkerIds((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName,
          customer_phone: customerPhone || null,
          description,
          date,
          start_time: time,
          duration,
          worker_ids: selectedWorkerIds,
        }),
      })

      if (res.ok) {
        onCreated()
        onClose()
      } else {
        const err = await res.json()
        alert(err.error || "Nepavyko išsaugoti")
      }
    } catch {
      alert("Klaida saugant vizitą")
    } finally {
      setSaving(false)
    }
  }

  const dateLabel = new Date(date + "T00:00:00").toLocaleDateString("lt-LT", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  const inputClass =
    "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-brand-black placeholder-gray-400 bg-white transition focus:border-primary focus:ring-1 focus:ring-primary outline-none"

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1.5 bg-primary" />

        <div className="p-6">
          <div className="flex items-start justify-between mb-1">
            <h2 className="text-lg font-black text-brand-black">Naujas vizitas</h2>
            <button
              onClick={onClose}
              className="text-gray-300 hover:text-gray-500 transition-colors duration-150 text-xl leading-none"
              aria-label="Uždaryti"
            >
              &times;
            </button>
          </div>
          <p className="text-sm text-gray-400 mb-5 capitalize">{dateLabel}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Kliento vardas *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                placeholder="Vardas Pavardė"
                className={inputClass}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Telefono numeris
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+370 600 00000"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Pradžios laikas *
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Trukmė (min) *
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  required
                  min={15}
                  step={15}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Aprašymas *
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="pvz. Padangų keitimas, ratų balansavimas..."
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Darbuotojai *
              </label>
              <div className="flex flex-wrap gap-2">
                {workers.map((worker) => {
                  const selected = selectedWorkerIds.includes(worker.id)
                  return (
                    <label
                      key={worker.id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium cursor-pointer transition-all duration-150 ${
                        selected
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleWorker(worker.id)}
                        className="sr-only"
                      />
                      {worker.name}
                    </label>
                  )
                })}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2.5 rounded-lg text-sm transition-colors duration-150 shadow-sm disabled:opacity-50"
              >
                {saving ? "Saugoma..." : "Išsaugoti vizitą"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
