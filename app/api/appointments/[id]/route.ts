import { NextRequest, NextResponse } from "next/server";
import {prisma} from "@/lib/prisma"

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const appointmentId = parseInt(id, 10)

    if (isNaN(appointmentId)) {
        return NextResponse.json(
            { error: "Invalid appointment ID" },
            { status: 400 }
        )
    }

    try {
        const body = await request.json()
        const {
            customer_name,
            customer_phone,
            description,
            date,
            start_time,
            duration,
            worker_ids,
        } = body

        if (!customer_name || !description || !date || !duration || !start_time) {
            return NextResponse.json(
                { error: "Missing required fields: customer_name, description, date, start_time, duration" },
                { status: 400 }
            )
        }

        if (!Array.isArray(worker_ids) || worker_ids.length === 0) {
            return NextResponse.json(
                { error: "At least one worker must be assigned" },
                { status: 400 }
            )
        }

        const appointmentDate = new Date(date)
        const appointmentStartTime = new Date(`1970-01-01T${start_time}:00Z`)

        const appointment = await prisma.$transaction(async (tx) => {
            await tx.appointmentWorker.deleteMany({
                where: { appointment_id: appointmentId },
            })

            return tx.appointment.update({
                where: { id: appointmentId },
                data: {
                    customer_name,
                    customer_phone: customer_phone || null,
                    description,
                    date: appointmentDate,
                    start_time: appointmentStartTime,
                    duration,
                    workers: {
                        create: worker_ids.map((wid: number) => ({
                            worker_id: wid,
                        })),
                    },
                },
                include: {
                    workers: {
                        include: {
                            worker: true,
                        },
                    },
                },
            })
        })

        return NextResponse.json(appointment)
    } catch (error) {
        console.error("Error updating appointment: ", error)
        return NextResponse.json(
            { error: "Failed to update appointment" },
            { status: 500 }
        )
    }
}

export async function DELETE(
    _request: NextRequest,
    { params} : { params: Promise <{ id: string }>}
){
    const {id} = await params
    const appointmentId = parseInt(id,10)

    if (isNaN(appointmentId)){
        return NextResponse.json(
            { error: "Invalid appointment ID"},
            {status: 400}
        )
    }

    try{
        await prisma.$transaction([
            prisma.appointmentWorker.deleteMany({
                where: { appointment_id: appointmentId},
            }),
            prisma.appointment.delete({
                where: {id: appointmentId}
            })
        ])

        return NextResponse.json({ message: "Appoint deleted successsfully"})
    } catch (error){
        console.error ("Error deleting the appointment: ", error)
        return NextResponse.json(
            { message: "Error deleting appointment" },
            {status: 500}
            )
    }
}