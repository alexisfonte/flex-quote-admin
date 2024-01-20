import prismadb from "@/lib/prismadb";
import { QuoteColumn } from "./components/columns";
import { format } from "date-fns";
import QuotesClient from "./components/client";

export const revalidate = 0;
async function QuotesPage() {
  const quotes = await prismadb.quote.findMany({
    where: {
      acceptedTerms: true,
      isDeleted: false
    },
    include: {
      quoteItems: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedQuotes: QuoteColumn[] = quotes.map((item) => ({
    id: item.id,
    quoteNum: item.quoteNum === null ? undefined : item.quoteNum,
    name: `${item.firstName} ${item.lastName}`,
    email: item.email,
    phone: item.phone,
    company: item.company ? item.company : "",
    department: item.deliveryMethod,
    status: item.status,
    startDate: format(item.startDate, "M/d/yy"),
    endDate: format(item.endDate, "M/d/yy"),
    totalItems: item.quoteItems.reduce((total, item) => {
      return total + Number(item.quantity);
    }, 0),
    submittedAt: item.submittedAt ? item.submittedAt : "-",
    updatedAt: item.updatedAt.getTime(),
  }));

  const filteredQuotes: QuoteColumn[] = formattedQuotes.filter(
    (item) => item.totalItems > 0
  );
  function sortByStatus(a: QuoteColumn, b: QuoteColumn) {
    const statusOrder = {
      NEW: 0,
      NEW_NOTE: 0,
      READ: 1,
      PENDING: 2,
      IMPORTED: 3,
    };

    const statusComparison = statusOrder[a.status] - statusOrder[b.status];

    if (statusComparison === 0) {
      return b.updatedAt - a.updatedAt;
    }

    return statusComparison;
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <QuotesClient data={filteredQuotes.sort(sortByStatus)} />
      </div>
    </div>
  );
}

export default QuotesPage;
