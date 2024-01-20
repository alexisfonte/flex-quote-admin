import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    if (!params.categoryId) {
      return new NextResponse("Category id is required", { status: 400 });
    }

    const category = await prismadb.category.findUnique({
      where: {
        id: params.categoryId,
        isDeleted: false
      },
      include: {
        banner: true,
        children: {
          orderBy: {
            globalSortOrdinal: "asc"
          }
        },
        parent: true
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.log(`[CATEGORY_GET]`, error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { name, parentId, bannerId } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.categoryId) {
      return new NextResponse("Category id is required", { status: 400 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }


    const category = await prismadb.category.update({
      where: {
        id: params.categoryId
      },
      data: {
        name,
        parentId,
        bannerId
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.log("[CATEGORY_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.categoryId) {
      return new NextResponse("Banner id is required", { status: 400 });
    }

    const category = await prismadb.category.updateMany({
      where: {
        id: params.categoryId,
      },
      data: {
        isDeleted: true
      }
    });

    return NextResponse.json(category);
  } catch (error) {
    console.log(`[CATEGORY_DELETE]`, error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
