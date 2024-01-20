import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb";

export async function GET(
    req: Request,
    { params }: { params: { manufacturerId: string }}
) {
    try{

        if (!params.manufacturerId){
            return new NextResponse("Manufacturer id is required", { status: 400})
        }


        const manufacturer = await prismadb.manufacturer.findUnique({
            where: {
                id: params.manufacturerId,
                isDeleted: false
            }
        })

        return NextResponse.json(manufacturer)

    } catch(error){
        console.log(`[MANUFACTURER_GET]`, error)
        return new NextResponse("Internal error", { status: 500 })
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: { manufacturerId: string }}
) {
    try{
        const { userId } = auth();
    const body = await req.json();

    const { name, country } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!params.manufacturerId) {
      return new NextResponse("Manufacturer Id is required", { status: 400 });
    }

        const manufacturer = await prismadb.manufacturer.updateMany({
            where: {
                id: params.manufacturerId
            },
            data: {
                name, 
                country
            }
        })

        return NextResponse.json(manufacturer)

    } catch(error){
        console.log(`[MANUFACTURER_PATCH]`, error)
        return new NextResponse("Internal error", { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { manufacturerId: string }}
) {
    try{
        const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.manufacturerId) {
      return new NextResponse("Manufacturer Id is required", { status: 400 });
    }

        const manufacturer = await prismadb.manufacturer.updateMany({
            where: {
                id: params.manufacturerId
            },
            data: {
              isDeleted: true
            }
        })

        return NextResponse.json(manufacturer)

    } catch(error){
        console.log(`[MANUFACTURER_DELETE]`, error)
        return new NextResponse("Internal error", { status: 500 })
    }
}