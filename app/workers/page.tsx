"use client"

import { useState, useEffect } from "react"

interface Worker {
    id: number,
    name: string,
    created_at: string
}

export default function WorkersPage() {
    const [workers, setWorkers] = useState<Worker[]>([])
    const [name, setName] = useState("")
    const [loading, setLoading] = useState(true)
    
    useEffect(() => {
        fetchWorkers()
    }, [])

    async function fetchWorkers(){
        const response = await fetch("/api/workers")
        const data = await response.json()
        setWorkers(data)
        setLoading(false)
    }

    async function handleAdd(e : React.FormEvent){
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
        await fetch(`/api/workers/${id}`, {
            method: "DELETE"
        })

        setWorkers(workers.filter(worker=> worker.id !== id))
    }

    if (loading) return <p className="p-8">Loading...</p>

    return(
        <div className="max-w-xl mx-auto p-8">
            <h1 className="text-2xl font-bold mb-6">Manage Workers</h1>

            <form 
                onSubmit={handleAdd}
            >
                <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Worker name"
                className="border rounded px-3 py-2 flex-1"
                required
                />
                <button
                    type="submit"
                    className="mx-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                > Add </button>
            </form>
            <ul className="space-y-2">
                {workers.map((worker) => (
                    <li
                    key={worker.id}
                    className="flex justify-between items-center border rounded px-4 py-3"
                    >
                        <span>{worker.name}</span>
                        <button
                            onClick={() => handleDelete(worker.id)}
                            className="text-red-600 hover:text-red-800 transition"
                            >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
    }
