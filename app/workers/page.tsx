"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/Navbar"

interface Worker {
  id: number
  name: string
  created_at: string
}

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWorkers()
  }, [])

  async function fetchWorkers() {
    const response = await fetch("/api/workers")
    const data = await response.json()
    setWorkers(data)
    setLoading(false)
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()

    const response = await fetch("/api/workers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })

    const newWorker = await response.json()
    setWorkers([...workers, newWorker])
    setName("")
  }

  async function handleDelete(id: number) {
    await fetch(`/api/workers/${id}`, { method: "DELETE" })
    setWorkers(workers.filter((worker) => worker.id !== id))
  }

  return (
    <div className="min-h-screen bg-brand-gray">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-10">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-brand-black">Darbuotojai</h1>
          <p className="text-sm text-gray-500 mt-1">Tvarkykite serviso darbuotojų sąrašą</p>
        </div>

        {/* Add worker form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-base font-bold text-brand-black mb-4">Pridėti darbuotoją</h2>
          <form onSubmit={handleAdd} className="flex gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Vardas Pavardė"
              required
              className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-brand-black placeholder-gray-400 bg-white transition"
            />
            <button
              type="submit"
              className="bg-primary hover:bg-primary-dark text-white font-bold px-5 py-2.5 rounded-lg text-sm transition-colors duration-150 shadow-sm whitespace-nowrap"
            >
              + Pridėti
            </button>
          </form>
        </div>

        {/* Workers list */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-brand-black">
              Darbuotojų sąrašas
              <span className="ml-2 text-sm font-semibold text-gray-400">({workers.length})</span>
            </h2>
          </div>

          {loading ? (
            <div className="px-6 py-8 text-center text-gray-400 text-sm">Kraunama...</div>
          ) : workers.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-400 text-sm">
              Darbuotojų nerasta. Pridėkite pirmąjį.
            </div>
          ) : (
            <ul>
              {workers.map((worker, i) => (
                <li
                  key={worker.id}
                  className={`flex justify-between items-center px-6 py-4 ${
                    i !== workers.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary text-xs font-bold">
                        {worker.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-semibold text-brand-black text-sm">{worker.name}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(worker.id)}
                    className="text-gray-400 hover:text-primary text-sm font-medium transition-colors duration-150"
                  >
                    Ištrinti
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  )
}
