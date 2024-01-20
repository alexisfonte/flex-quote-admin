import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { value } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!value) {
      return new NextResponse("Value is required", { status: 400 });
    }


    const size = await prismadb.size.create({
      data: {
        value
      },
    });

    return NextResponse.json(size);
  } catch (error) {
    console.log(`[SIZE_POST]`, error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const sizes = await prismadb.size.findMany({
      where: {
        isDeleted: false
      },
    });

    return NextResponse.json(sizes);
  } catch (error) {
    console.log(`[SIZES_GET]`, error);
    return new NextResponse("Internal error", { status: 500 });
  }
}