import { clientSearch, exportQuote } from "@/lib/flex-actions";
import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { orgSlug: string; orgId: string; quoteId: string } }
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
        id: params.quoteId
      },
    });

    if (!quote) {
      return new NextResponse("Invalid quote Id", { status: 400 });
    }

    const client = await clientSearch(quote.id)

    const flexQuote = await exportQuote(quote.id, client)

    // {
    //     "id": "e08b60c8-ba18-11e1-8260-22000afc4ec4",
    //     "name": "Rental Will Call",
    //     "deleted": false,
    //     "domainId": "department"
    // },
    // {
    //     "id": "e6ca12fc-065a-11e2-8e64-22000afc4ec4",
    //     "name": "Rental with Delivery",
    //     "deleted": false,
    //     "domainId": "department"
    // },

    return NextResponse.json(quote);
  } catch (error) {
    console.log(`[QUOTE_EXPORT_PATCH]`, error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

