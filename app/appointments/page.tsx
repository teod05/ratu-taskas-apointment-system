"use client"

import { useState, useEffect, FormEvent } from "react"
import Navbar from "@/components/Navbar"

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

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(true)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [duration, setDuration] = useState(0)
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<number[]>([])

  async function fetchData() {
    try {
      const [appointmentsRes, workersRes] = await Promise.all([
        fetch("/api/appointments"),
        fetch("/api/workers"),
      ])

      const appointmentsData = await appointmentsRes.json()
      const workersData = await workersRes.json()

      setAppointments(appointmentsData)
      setWorkers(workersData)
    } catch (error) {
      console.error("Error fetching data: ", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  function resetForm() {
    setEditingId(null)
    setCustomerName("")
    setCustomerPhone("")
    setDescription("")
    setDate("")
    setStartTime("")
    setDuration(0)
    setSelectedWorkerIds([])
  }

  function handleEdit(appt: Appointment) {
    setEditingId(appt.id)
    setCustomerName(appt.customer_name)
    setCustomerPhone(appt.customer_phone || "")
    setDescription(appt.description)
    setDate(new Date(appt.date).toISOString().split("T")[0])
    const d = new Date(appt.start_time)
    setStartTime(d.toLocaleTimeString("lt-LT", { hour: "2-digit", minute: "2-digit", hour12: false }))
    setDuration(appt.duration)
    setSelectedWorkerIds(appt.workers.map((w) => w.worker_id))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const payload = {
      customer_name: customerName,
      customer_phone: customerPhone || null,
      description,
      date,
      start_time: startTime,
      duration,
      worker_ids: selectedWorkerIds,
    }

    try {
      const res = editingId
        ? await fetch(`/api/appointments/${editingId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/appointments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })

      if (res.ok) {
        resetForm()
        fetchData()
      } else {
        const errorData = await res.json()
        alert(errorData.error || "Failed to save appointment")
      }
    } catch (error) {
      console.error("Error saving appointment")
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Ar tikrai norite ištrinti šį vizitą?")) return

    try {
      await fetch(`/api/appointments/${id}`, { method: "DELETE" })
      fetchData()
    } catch (error) {
      console.error("Error deleting appointment: ", error)
    }
  }

  function toggleWorker(workerId: number) {
    setSelectedWorkerIds((prev) =>
      prev.includes(workerId) ? prev.filter((id) => id !== workerId) : [...prev, workerId]
    )
  }

  function formatTime(isoString: string): string {
    const d = new Date(isoString)
    return d.toLocaleTimeString("lt-LT", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  function formatDate(isoString: string): string {
    const d = new Date(isoString)
    return d.toLocaleDateString("lt-LT", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const inputClass =
    "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-brand-black placeholder-gray-400 bg-white transition"

  return (
    <div className="min-h-screen bg-brand-gray">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-brand-black">Vizitai</h1>
          <p className="text-sm text-gray-500 mt-1">Kurkite ir valdykite klientų vizitus</p>
        </div>

        {/* New appointment form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-brand-black">
              {editingId ? "Redaguoti vizitą" : "Naujas vizitas"}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-gray-400 hover:text-gray-600 font-medium transition-colors duration-150"
              >
                Atšaukti redagavimą
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Data *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Pradžios laikas *
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
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
                className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-colors duration-150 shadow-sm"
              >
                {editingId ? "Atnaujinti vizitą" : "Išsaugoti vizitą"}
              </button>
            </div>
          </form>
        </div>

        {/* Appointments list */}
        <div>
          <h2 className="text-base font-bold text-brand-black mb-4">
            Vizitų sąrašas
            <span className="ml-2 text-sm font-semibold text-gray-400">({appointments.length})</span>
          </h2>

          {loading ? (
            <div className="text-center text-gray-400 text-sm py-8">Kraunama...</div>
          ) : appointments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 px-6 py-10 text-center text-gray-400 text-sm shadow-sm">
              Vizitų nerasta. Sukurkite pirmąjį.
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((appt) => (
                <div
                  key={appt.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4 flex justify-between items-start gap-4 hover:shadow-md transition-shadow duration-150"
                >
                  <div className="flex gap-4 items-start">
                    <div className="w-1 self-stretch rounded-full bg-primary shrink-0" />
                    <div>
                      <h3 className="font-bold text-brand-black text-sm">{appt.customer_name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{appt.description}</p>
                      <p className="text-xs text-gray-400 mt-1.5">
                        {formatDate(appt.date)} &nbsp;&bull;&nbsp; {formatTime(appt.start_time)} &nbsp;&bull;&nbsp; {appt.duration} min
                      </p>
                      {appt.workers.length > 0 && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {appt.workers.map((w) => w.worker.name).join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0 pt-0.5">
                    <button
                      onClick={() => handleEdit(appt)}
                      className="text-gray-300 hover:text-brand-black text-xs font-medium transition-colors duration-150"
                    >
                      Redaguoti
                    </button>
                    <button
                      onClick={() => handleDelete(appt.id)}
                      className="text-gray-300 hover:text-primary text-xs font-medium transition-colors duration-150"
                    >
                      Ištrinti
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
