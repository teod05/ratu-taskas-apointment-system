import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
// import { useSearchParams } from "next/navigation";
import { prisma } from "@/lib/prisma";

// Fetches all appointments. Supports optional ?date=YYYY-MM-DD query param to
// filter down to one day. Each appointment includes its assigned workers.

export async function GET(request: NextRequest){

    try{
        const {searchParams} = request.nextUrl

        const dateParam = searchParams.get("date")
        const startDate = searchParams.get("startDate")
        const endDate = searchParams.get("endDate")

        let where : any = {}

        if(dateParam) {
            const targetDate = new Date(dateParam)
            where.date = targetDate
        } else if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte : new Date(endDate)
            }
        }

       const appointments = await prisma.appointment.findMany({
        where,
        include: {
            workers: {
                include: {
                    worker: true,
                },
            },
        },
        orderBy: {
            start_time: "asc"
        },
       })

       return NextResponse.json(appointments)
    } catch (error) {
        console.error("Error fetching appointments: ", error)
        return NextResponse.json(
            {error: "Failed to fetch appointments"},
            { status: 500}
        )
    }
    }

    export async function POST (request: NextRequest) {
        try {
            const body = await request.json()

            const {
                customer_name,
                customer_phone,
                description,
                date,
                start_time,
                duration,
                worker_ids
            } = body

            if (!customer_name || !description || !description || !date || !duration || !start_time) {
                return NextResponse.json(
                    { error: "Missing required fields: customer_name, description, date, start_time, duration"},
                    { status : 400}
                )
            }

            if(!Array.isArray(worker_ids) || worker_ids.length === 0) {
                return NextResponse.json(
                    {error: "At least one worker must be assigned (worker_ids array"},
                    { status: 400}
                )
            }

            const appointmentDate = new Date(date)
            const appointmentStartTime = new Date(`1970-01-01T${start_time}:00Z`)

            const appointment = await prisma.appointment.create({
                data: {
                    customer_name,
                    customer_phone,
                    description,
                    date: appointmentDate,
                    start_time: appointmentStartTime,
                    duration,
                    workers: {
                        create: worker_ids.map((id: number) => ({
                            worker_id : id
                        }))
                    }

                },
                include: {
                    workers: {
                        include: {
                            worker: true
                        }
                    }
                }
            })
            return NextResponse.json(appointment, {status : 201})

        }   catch(error){

            console.error("error creating appointment: ", error)
            return NextResponse.json(
                {error: "Failed to create appointment"},
                {status: 500}
            )

        }
    }