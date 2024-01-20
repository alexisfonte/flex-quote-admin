import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function DELETE(
  req: Request
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const products = await prismadb.product.updateMany({
      data: {
        isDeleted: true,
      },
    });

    const categories = await prismadb.category.updateMany({
      data: {
        isDeleted: true,
      },
    });

    const manufacturers = await prismadb.manufacturer.updateMany({
      data: {
        isDeleted: true,
      },
    });

    const sizes = await prismadb.size.updateMany({
      data: {
        isDeleted: true,
      },
    });

    return NextResponse.json({ products, categories, manufacturers, sizes });
  } catch (error) {
    console.log(`[INVENTORY_DELETE]`, error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
