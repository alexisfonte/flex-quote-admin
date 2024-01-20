import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb";

export async function GET(
    req: Request,
    { params }: { params: { sizeId: string }}
) {
    try{
        
        if (!params.sizeId){
            return new NextResponse("Size id is required", { status: 400})
        }


        const size = await prismadb.size.findUnique({
            where: {
                id: params.sizeId,
                isDeleted: false
            }
        })

        return NextResponse.json(size)

    } catch(error){
        console.log(`[SIZE_GET]`, error)
        return new NextResponse("Internal error", { status: 500 })
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: { sizeId: string }}
) {
    try{
        const { userId } = auth();
    const body = await req.json();

    const { value } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!value) {
      return new NextResponse("Value is required", { status: 400 });
    }

    if (!params.sizeId) {
      return new NextResponse("Size Id is required", { status: 400 });
    }

        const size = await prismadb.size.updateMany({
            where: {
                id: params.sizeId
            },
            data: {
                value
            }
        })

        return NextResponse.json(size)

    } catch(error){
        console.log(`[SIZE_PATCH]`, error)
        return new NextResponse("Internal error", { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { sizeId: string }}
) {
    try{
        const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.sizeId) {
      return new NextResponse("Manufacturer Id is required", { status: 400 });
    }

        const size = await prismadb.size.updateMany({
            where: {
                id: params.sizeId
            },
            data: {
              isDeleted: true
            }
        })

        return NextResponse.json(size)

    } catch(error){
        console.log(`[SIZE_DELETE]`, error)
        return new NextResponse("Internal error", { status: 500 })
    }
}