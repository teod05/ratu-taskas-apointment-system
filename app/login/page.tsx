"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push("/")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-gray px-4">
      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Red top bar */}
        <div className="h-1.5 bg-primary" />

        <div className="px-8 py-10">
          {/* Logo */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black text-brand-black tracking-tight">
              Ratų <span className="text-primary">Taškas</span>
            </h1>
            <p className="mt-1 text-sm text-gray-500 font-medium">Padangų serviso sistema</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              <span className="mt-0.5 shrink-0">&#9888;</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-brand-black mb-1.5">
                El. paštas
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="vardas@example.com"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-brand-black placeholder-gray-400 bg-white transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-black mb-1.5">
                Slaptažodis
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-brand-black placeholder-gray-400 bg-white transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed text-sm tracking-wide shadow-sm mt-2"
            >
              {loading ? "Prisijungiama..." : "Prisijungti"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
