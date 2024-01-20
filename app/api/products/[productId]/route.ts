import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { Product } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    if (!params.productId) {
      return new NextResponse("Product id is required", { status: 400 });
    }

    const product = await prismadb.product.findUnique({
      where: {
        id: params.productId,
        isDeleted: false,
      },
      include: {
        images: true,
        category: true,
        size: true,
        manufacturer: true,
      },
    });

    if (!product){
      return new NextResponse("Product not found", {status: 404})
    }

    const getProductBreadcrumbs = async (categoryId: string, product: Product) => {
      const category = await prismadb.category.findUnique({
        where: {
          id: categoryId,
          isDeleted: false
        },
        select: {
          id: true,
          name: true,
          parent: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })
      if (!category) {
        return [];
      }

      const result = [{ id: category.id, name: category.name, href: `/category/${category.id}`}]
      if (product.categoryId === category.id){
        result.push(...[{id: product.id, name: product.name, href: `/product/${product.id}`}])
      }

      if (category.parent) {
        const parent = await getProductBreadcrumbs(category.parent.id, product)
        if (parent[0].name !== "Website Cart"){
          result.unshift(...parent)
        }
      }

      return result
    }

    const breadcrumbs = await getProductBreadcrumbs(product?.categoryId, product)

    return NextResponse.json({product, breadcrumbs});
  } catch (error) {
    console.log(`[PRODUCT_GET]`, error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const {
      name,
      description,
      weight,
      dimensions,
      manufacturerId,
      categoryId,
      sizeId,
      images,
      isFeatured,
     isArchived, barcode } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.productId) {
      return new NextResponse("Banner id is required", { status: 400 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!description) {
      return new NextResponse("Description is required", { status: 400 });
    }

    if (!images || !images.length) {
      return new NextResponse("Images are required", { status: 400 });
    }

    if (!categoryId) {
      return new NextResponse("Category id is required", { status: 400 });
    }

    await prismadb.product.update({
      where: {
        id: params.productId,
      },
      data: {
        name,
        description,
        weight,
        dimensions,
        manufacturerId,
        categoryId,
        sizeId,
        barcode,
        images: {
          deleteMany: {},
        },
        isFeatured,
        isArchived,
      },
    });

    const product = await prismadb.product.update({
      where: {
        id: params.productId,
      },
      data: {
        images: {
          createMany: {
            data: [...images.map((image: { url: string }) => image)],
          },
        },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCT_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.productId) {
      return new NextResponse("Product id is required", { status: 400 });
    }

    const product = await prismadb.product.updateMany({
      where: {
        id: params.productId,
      },
      data: {
        isDeleted: true
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log(`[BANNER_DELETE]`, error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
