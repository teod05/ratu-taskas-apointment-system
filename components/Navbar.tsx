"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const pathname = usePathname()

  const links = [
    { href: "/calendar", label: "Calendar" },
    { href: "/appointments", label: "Appointments" },
    { href: "/workers", label: "Workers" },
  ]

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/calendar" className="flex items-center gap-3 select-none">
            <div className="flex flex-col gap-[3px]">
              <div className="w-6 h-[3px] bg-[#E8001D] rounded-full" />
              <div className="w-4 h-[3px] bg-[#E8001D] rounded-full" />
            </div>
            <span className="text-xl font-black text-[#111111] tracking-tight">
              Ratų <span className="text-[#E8001D]">Taškas</span>
            </span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                  pathname === href
                    ? "bg-[#E8001D] text-white shadow-sm"
                    : "text-gray-500 hover:text-[#111111] hover:bg-gray-100"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
