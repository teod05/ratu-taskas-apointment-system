import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-gray flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-8xl font-black text-primary">404</h1>
        <p className="text-xl font-bold text-brand-black mt-4">Puslapis nerastas</p>
        <p className="text-sm text-gray-500 mt-2">Atsiprašome, toks puslapis neegzistuoja.</p>
        <Link
          href="/calendar"
          className="inline-block mt-6 px-6 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg text-sm transition-colors duration-150 shadow-sm"
        >
          Grįžti į kalendorių
        </Link>
      </div>
    </div>
  )
}
