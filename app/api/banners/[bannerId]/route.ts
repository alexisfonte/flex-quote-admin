import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { bannerId: string } }
) {
  try {
    if (!params.bannerId) {
      return new NextResponse("Banner id is required", { status: 400 });
    }

    const banner = await prismadb.banner.findUnique({
      where: {
        id: params.bannerId,
      },
    });

    return NextResponse.json(banner);
  } catch (error) {
    console.log(`[BANNER_GET]`, error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { bannerId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { label, imageURL, isArchived, link } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.bannerId) {
      return new NextResponse("Banner id is required", { status: 400 });
    }

    if (!label) {
      return new NextResponse("Label is required", { status: 400 });
    }

    if (!imageURL) {
      return new NextResponse("Image is required", { status: 400 });
    }

    if (!link) {
      return new NextResponse("Link is required", { status: 400 });
    }

    const banner = await prismadb.banner.update({
      where: {
        id: params.bannerId,
      },
      data: {
        label,
        isArchived,
        imageURL,
        link,
      },
    });

    return NextResponse.json(banner);
  } catch (error) {
    console.log("[BANNER_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { bannerId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.bannerId) {
      return new NextResponse("Banner id is required", { status: 400 });
    }

    const banner = await prismadb.banner.deleteMany({
      where: {
        id: params.bannerId,
      },
    });

    return NextResponse.json(banner);
  } catch (error) {
    console.log(`[BANNER_DELETE]`, error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
