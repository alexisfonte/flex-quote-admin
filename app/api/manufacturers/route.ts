import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { name, country } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const manufacturer = await prismadb.manufacturer.create({
      data: {
        name,
        country
      },
    });

    return NextResponse.json(manufacturer);
  } catch (error) {
    console.log(`[MANUFACTURER_POST]`, error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {

    const manufacturers = await prismadb.manufacturer.findMany({
      where: {
        isDeleted: false
      },
    });

    return NextResponse.json(manufacturers);
  } catch (error) {
    console.log(`[MANUFACTURERS_GET]`, error);
    return new NextResponse("Internal error", { status: 500 });
  }
}