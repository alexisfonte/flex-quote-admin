import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {

    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get("parentId") || undefined
    

    const categories = await prismadb.category.findMany({
      where: {
        parentId,
        isDeleted: false
      },
      orderBy: {
        globalSortOrdinal: "asc"
      }
    });

    const res = NextResponse.json(categories)

    return res;
  } catch (error) {
    console.log(`[CATEGORIES_GET]`, error);
    return new NextResponse("Internal error", { status: 500 });
  }
}



export async function POST(
  req: Request
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { name, parentId, bannerId } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }


    const category = await prismadb.category.create({
      data: {
        name,
        parentId,
        bannerId,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.log("[CATEGORY_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
