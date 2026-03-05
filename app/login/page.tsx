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


    async function handleSubmit(e:React.FormEvent){
        e.preventDefault()
        setError("")
        setLoading(true)

        const supabase = createClient()

        const {error} = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error) {
            setError(error.message)
            setLoading(false)
            return
        }

        router.push("/")

    }

    return(
        
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit}
            className="p-8 w-1xl m-3 md:w-2xl lg:w-3xl bg-white w-min-sm border rounded-lg shadow-md"
            >
                {error && 
                    <p className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
                    {error} 
                    </p>}

                <h1>Ratų Taškas</h1>
                <label>Email</label>
                <input 
                    type="email"
                    value={email}
                    className="w-full border"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <label>Password</label>
                <input
                    type="password"
                    value = {password}
                    className="w-full border"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button
                type="submit"
                disabled={loading}
                className="w-auto border border-gray-300 rounded px-3 py-3 bg-blue-400 hover:bg-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                {loading ? "Signing in..." : "Sign in"}
                </button>
            </form>
            

        </div>
    )
}

