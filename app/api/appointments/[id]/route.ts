import { NextRequest, NextResponse } from "next/server";
import {prisma} from "@/lib/prisma"

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