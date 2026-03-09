"use client"

// ✅
import { useState, useEffect, FormEvent } from "react"


interface Worker {
    id: number,
    name: string;
}

interface AppointmentWorker {
    worker_id: number,
    worker: Worker
}

interface Appointment {
    id: string,
    customer_name : string,
    customer_phone: string | null,
    description: string,
    date: string,
    start_time: string,
    duration: number,
    workers: AppointmentWorker[]
}

export default function AppointmentsPage(){
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [workers, setWorkers] = useState<Worker[]>([])
    const [loading, setLoading] = useState(true)

    const [customerName, setCustomerName] = useState("")
    const [customerPhone, setCustomerPhone] = useState("")
    const [description, setDescription] = useState("")
    const [date, setDate] = useState("")
    const [startTime, setStartTime] = useState("")
    const [duration, setDuration] = useState(0)
    const [selectedWorkerIds, setSelectedWorkerIds] = useState<number[]>([])


    async function fetchData(){

        try{
            const [appointmentsRes,workersRes ] = await Promise.all([
                fetch("/api/appointments"),
                fetch("/api/workers")
            ])

            const appointmentsData = await appointmentsRes.json()
            const workersData = await workersRes.json()
            
            setAppointments(appointmentsData)
            setWorkers(workersData)
        } catch (error) {
            console.error ("Error fetching data: ", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    async function handleSubmit(e :FormEvent) {
        e.preventDefault()

           try {
            const res = await fetch("/api/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customer_name: customerName,
                    customer_phone: customerPhone || null,
                    description,
                    date,
                    start_time: startTime,
                    duration,
                    worker_ids: selectedWorkerIds,
                    }),
      });

      if(res.ok){
        setCustomerName("");
        setCustomerPhone("");
        setDescription("");
        setDate("");
        setStartTime("");
        setDuration(60);
        setSelectedWorkerIds([]);
        fetchData();
      } else {
        const errorData = await res.json()
        alert(errorData.error || "Failed to create appointment")
      }

    } catch (error) {
        console.error("Error creating appointment")
    }
}

    async function handleDelete(id: string) {
        if (!window.confirm("Are you sure you want to delete the appointment> ")) {
            return
        }

        try{
            await fetch(`/api/appointments/${id}`, { method: "DELETE"})
            fetchData()
        } catch(error) {
            console.error("Error deleting appointment: ", error)
        }
    } 

     function toggleWorker(workerId: number) {
        setSelectedWorkerIds((prev) => 
        prev.includes(workerId)
        ? prev.filter((id) => id !== workerId)
        : [...prev, workerId]
    )
    }

    function formatTime(isoString: string): string{
        const d = new Date(isoString)
        return d.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        })
    }

    function formatDate(isoString: string): string {
        const d = new Date(isoString)
        return d.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric"
        })
    }

    if (loading) {
        return <div className="p-8">
             <h1>Loading...</h1>
        </div>
    }

    return (
        <div className="p-8 w-4xl mx-auto">
            <h1 className="text-lg font-semibold">Appointments</h1>

            <form
            className="mb-8 bg-white p-6 rounded-lg shadow space-y-4"
            onSubmit={handleSubmit}
            >
                <h2 className="text-lg font-semibold">New Appointment</h2>

                <div>
                    <label htmlFor="customerName" className="block text-sm font-semibold ,b-1">
                        Customer Name
                    </label>
                    <input
                    id="customerName"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    className="w-full border rounded px-3 py-2"
                    />
                </div>

                <div>
                    <label htmlFor="customerPhone" className="block text-sm font-medium mb-1">Customer Phone Number</label>
                    <input
                        id="cusomerPhone"
                        type="text"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        required
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                <div>
                    <label htmlFor="date"className="block text-sm font-medium mb-1">Date *</label>
                    <input
                        id="date"
                        type="date"
                        value = {date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Start time</label>
                    <input
                        type="time"
                        value={startTime}
                        className="w-full border rounded px-3 py-2"
                        required
                        onChange={(e) => setStartTime(e.target.value)}
                    />

                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Duration</label>
                    <input
                        type="number"
                        value={duration}
                        className="w-full border rounded px-3 py-2"
                        onChange={(e) => setDuration(parseInt(e.target.value))}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <input
                        type="text"
                        value={description}
                        required
                        className="w-full border rounded px-3 py-2"
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Assign Workers *</label>
                        <div className="flex flex-wrap gap-4">
                            {workers.map((worker) => (
                            <label key={worker.id} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedWorkerIds.includes(worker.id)}
                                    onChange={() => toggleWorker(worker.id)}
                                /> 
                                {worker.name}     
                            </label>
                        ))}
                        </div>
                </div>
            
                <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounder hover:bg-blue-700"
                >
                    Submit Appointment
                </button>
        
            </form>
            
            <div className="space-y-4">

                {appointments.length === 0 ?(
                    <p className="text-gray-500">No appointments found</p>
                ) : (
                    appointments.map((appt) => (
                        <div key={appt.id}
                        className="bg-white p-4 rounded-lg shadow flex justify-between items-start"
                        >
                            <div>
                                <h3 className="font-semibold text-lg">{appt.customer_name}</h3>
                                <p className="text-sm text-gray-600">{appt.description}</p>
                                <p className="text-sm mt-1">
                                    {formatDate(appt.date)} &nbsp; ⏰ {formatTime(appt.start_time)}
                                     &nbsp; ({appt.duration} min)
                                </p>
                            </div>
                            <button
                            onClick={() => handleDelete(appt.id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                            >
                                Delete
                            </button>
                        </div>
                    ))
                )
                }
            </div>

        </div>
    )



}