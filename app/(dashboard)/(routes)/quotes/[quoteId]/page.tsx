import AvatarStack from "@/components/ui/avatar-stack";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prismadb from "@/lib/prismadb";
import { formatUSAndInternationalNumber } from "@/lib/utils";
import { auth, currentUser } from "@clerk/nextjs";
import { format } from "date-fns";
import ProductTable from "./components/product-table";
import QuoteActions from "./components/quote-actions";


type Props = {
  params: {
    quoteId: string;
  };
};

async function QuotePage({ params }: Props) {
  const { userId } = auth();
  const user = await currentUser();

  const quote = await prismadb.quote.findUnique({
    where: {
      id: params.quoteId,
    },
    include: {
      quoteItems: {
        select: {
          id: true,
          quantity: true,
            product: {
                select: {
                    id: true,
                    name: true,
                    barcode: true,
                    category: true,
                    images: true
                },
            },
        },
        orderBy: {
          product: {
            category: {
              globalSortOrdinal: "asc",
            },
          },
        },
      },
      staffNotes: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  const views = await prismadb.view.findMany({
    where: {
      quoteId: params.quoteId
    },
    distinct: ['userId'],
    select: {
      userId: true
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  if (!quote || !userId || !user || !views ) return null;

  const markAsRead = async () => {
    const newQuote = await prismadb.quote.update({
      where: {
        id: quote.id,
      },
      data: {
        status: "READ",
      },
    });
    const statusChange = await prismadb.statusChange.create({
      data: {
        quoteId: params.quoteId,
        userId,
        previousStatus: quote.status,
        newStatus: newQuote.status
      }
    })
  };

  if (quote.status === "NEW") {
    markAsRead();
  }

  if (quote.status === "NEW_NOTE" && quote.staffNotes[0].userId !== userId) {
    markAsRead();
  }

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h3 className="text-2xl font-bold tracking-tight">
            Quote #({quote.quoteNum || params.quoteId})
          </h3>
          <div className="flex items-center space-x-4">
            <AvatarStack userIds={views} />
            <QuoteActions />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Client</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <dl className="text-sm">
                  <div>
                    <dt className="sr-only">Company</dt>
                    <dd>{quote.company}</dd>
                  </div>
                  <div>
                    <dt className="sr-only">Name</dt>
                    <dd>
                      {quote.firstName} {quote.lastName}
                    </dd>
                  </div>
                  <div className="flex space-x-1">
                    <dt>Phone:</dt>
                    <dd>{formatUSAndInternationalNumber(quote.phone)}</dd>
                  </div>
                  <div className="flex space-x-1">
                    <dt>Email:</dt>
                    <dd>{quote.email}</dd>
                  </div>
                </dl>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="capitalize">
                {`${quote?.deliveryMethod.toLowerCase()} Details`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <dl className="text-sm">
                  <div className="flex space-x-1">
                    <dt className="flex space-x-1 capitalize">{`${
                      quote?.deliveryMethod === "DELIVERY"
                        ? "Delivery date"
                        : "Pickup date"
                    }:`}</dt>
                    <dd>{format(quote.startDate, "MM/dd/yyy")}</dd>
                  </div>
                  <div className="flex space-x-1">
                    <dt className="flex space-x-1 capitalize">{`${
                      quote?.deliveryMethod === "DELIVERY"
                        ? "Pickup date"
                        : "Return date"
                    }:`}</dt>
                    <dd>{format(quote.endDate, "MM/dd/yyyy")}</dd>
                  </div>
                  <div className="flex space-x-1">
                    <dt className="flex space-x-1 capitalize">Contact:</dt>
                    <dd>{quote?.deliveryContactName}</dd>
                  </div>
                  <div className="flex space-x-1">
                    <dt>Phone:</dt>
                    <dd>
                      {formatUSAndInternationalNumber(
                        quote.deliveryContactPhone
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Venue</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                {quote.deliveryMethod === "DELIVERY" && (
                  <dl>
                    <dd>{`${quote?.venueName}`}</dd>
                    <dd>{`${quote?.venueLine1} ${quote?.venueLine2}`}</dd>
                    <dd>{`${quote?.venueCity}, ${quote?.venueState}  ${quote?.venueZipcode}`}</dd>
                    <dd>{quote?.venueCountry}</dd>
                  </dl>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <div>
            <div className="space-y-4">
              {quote.notes && (
                <Card>
                  <CardHeader className="pb-0 text-base">Notes</CardHeader>
                  <CardContent className="text-sm">
                    <dd>{quote.notes}</dd>
                  </CardContent>
                </Card>
              )}
              <Card>
                <CardContent>
                    <ProductTable data={quote.quoteItems}/>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default QuotePage;
