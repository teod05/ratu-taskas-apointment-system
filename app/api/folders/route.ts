import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(){

    const workers = await prisma.worker.findMany()

    return NextResponse.json(workers)
}

export async function POST(request: Request){

    const body = await request.json()

    const worker = await prisma.worker.create({
        data: { name: body.name},
    })

    return NextResponse.json(worker, {status: 201})
}
