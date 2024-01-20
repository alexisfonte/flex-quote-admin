import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { quoteId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { status } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!status) {
      return new NextResponse("Status is required", { status: 400 });
    }

    if (!params.quoteId) {
      return new NextResponse("Quote id is required", { status: 400 });
    }

    const quote = await prismadb.quote.findFirst({
      where: {
        id: params.quoteId,
      },
    });

    if (!quote) {
      return new NextResponse("Invalid quote Id", { status: 400 });
    }

    const newQuote = await prismadb.quote.update({
      where: {
        id: quote.id,
      },
      data: {
        status,
      },
    });

    const statusChange = await prismadb.statusChange.create({
      data: {
        quoteId: quote.id,
        userId,
        previousStatus: quote.status,
        newStatus: newQuote.status
      }
    })

    return NextResponse.json(newQuote);
  } catch (error) {
    console.log(`[QUOTE_PATCH]`, error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { quoteId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.quoteId) {
      return new NextResponse("Quote id is required", { status: 400 });
    }

    const quote = await prismadb.quote.findFirst({
      where: {
        id: params.quoteId,
      },
    });

    if (!quote) {
      return new NextResponse("Invalid quote Id", { status: 400 });
    }

    const newQuote = await prismadb.quote.update({
      where: {
        id: quote.id,
      },
      data: {
        isDeleted: true
      },
    });

    return NextResponse.json(newQuote);
  } catch (error) {
    console.log(`[QUOTE_PATCH]`, error);
    return new NextResponse("Internal error", { status: 500 });
  }
}



