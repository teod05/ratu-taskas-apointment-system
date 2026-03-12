"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

const ADMIN_EMAIL = "info@ratutaskas.lt"

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null))
  }, [])

  const isAdmin = email === ADMIN_EMAIL

  const links = [
    { href: "/calendar", label: "Kalendorius", restricted: false },
    { href: "/appointments", label: "Vizitai", restricted: true },
    { href: "/workers", label: "Darbuotojai", restricted: true },
  ]

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/calendar" className="flex items-center gap-3 select-none">
            <div className="flex flex-col gap-0.75">
              <div className="w-6 h-0.75 bg-primary rounded-full" />
              <div className="w-4 h-0.75 bg-primary rounded-full" />
            </div>
            <span className="text-xl font-black text-brand-black tracking-tight">
              Ratų <span className="text-primary">Taškas</span>
            </span>
          </Link>

          {/* Nav links + logout */}
          <div className="flex items-center gap-1">
            {links
              .filter(({ restricted }) => !restricted || isAdmin)
              .map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                    pathname === href
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-500 hover:text-brand-black hover:bg-gray-100"
                  }`}
                >
                  {label}
                </Link>
              ))}

            <button
              onClick={handleLogout}
              className="ml-3 px-4 py-2 rounded-lg text-sm font-semibold text-gray-500 hover:text-brand-black hover:bg-gray-100 transition-all duration-150"
            >
              Atsijungti
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
