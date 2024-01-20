import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET(
  req: Request
) {
  try {
    const banners = await prismadb.banner.findMany({
      where: {
        isArchived: false
      }
    });

    return NextResponse.json(banners)

  } catch (error) {
    console.log(`[BANNERS_GET]`, error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: Request 
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { label, imageURL, isArchived, link } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
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

    const banner = await prismadb.banner.create({
      data: {
        label,
        imageURL,
        isArchived,
        link
      },
    });


    return NextResponse.json(banner);
  } catch (error) {
    console.log("[BANNER_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
