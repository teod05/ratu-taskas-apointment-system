import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
    request: Request,
    {params} : {params: Promise<{ id: string}>}
) {
    const { id } = await params

    await prisma.worker.delete({
        where : {
            id: parseInt(id)
        }
    })

    return NextResponse.json({ message: "Worker deleted"})
}

export async function PUT(
    request : Request,
    {params} : {params: Promise<{ id: string}>}
) {
    const { id } = await params
    const { name } = await request.json()

    const updateWorker = await prisma.worker.update({
        where: {id: parseInt(id)},
        data: {name}

    })

    return NextResponse.json({worker: updateWorker, message: "Worker Updated"})

}