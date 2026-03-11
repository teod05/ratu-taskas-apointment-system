
"use cilent"
import { timeToMinutes, minutesToLabel } from "@/lib/calendarUtils"


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

interface Props {
    appointment: Appointment
    onClose: () => void
}

export default function AppointmentDetailModal({appointment, onClose} : Props){

    if(!appointment) return null

    const startMins = timeToMinutes(appointment.start_time)
    const endMins = startMins + appointment.duration
    const workerNames = appointment.workers.map((w) => w.worker.name).join(',')

    return (

        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={onClose}
        >

            <div
            className="bg-white rounded-xl shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-xl font-bold mb-4"> Appointment Details</h2>

                <dl className="">
                    <div className=" flex gap-2">
                        <dt className="font-semibold w-32 shrink-0">Customer:</dt>
                        <dd>{appointment.customer_name}</dd>
                    </div>
                    {appointment.customer_phone && (
                        <div className="flex gap-2">
                            <dt className="font-semibold w-32 shrink-0">Phone:</dt>
                            <dd>{appointment.customer_phone}</dd>
                        </div>
                    )}
                    <div className="flex gap-2">
                        <dt className="font-semibold w-32 shrink-0">Description:</dt>
                        <dd>{appointment.description}</dd>
                    </div>

                    <div className="flex gap-2">
                        <dt className="font-semibold w-32 shrink-0">Time:</dt>
                        <dd>
                            {minutesToLabel(startMins)} - {minutesToLabel(endMins)} ({appointment.duration} min)
                        </dd>
                    </div>
                    {workerNames && (
                        <div className="flex gap-2">
                            <dt className="font-semibold w-32 shrink-0">Workers:</dt>
                            <dd>{workerNames}</dd>
                        </div>
                    )}
                </dl>

                <button 
                className="mt-6 w-full bg-gray-200 hover:bg-gray-300 rounded-lg py-2 font-medium"
                onClick={onClose}
                >
                    Close
                </button>

            </div>


        </div>
    )
}