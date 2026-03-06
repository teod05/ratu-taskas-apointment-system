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
        await fetch(`/api/workers${id}`, {
            method: "DELETE"
        })

        setWorkers(workers.filter(worker=> worker.id !== id))
    }

    if (loading) return <p className="p-8">Loading...</p>

    return(
        <div className="max-w-xl mxauto p-8">
            <h1>Manage Workers</h1>

            <form>
            {/* add workers, do it later */}
            </form>
        </div>
    )
    }
