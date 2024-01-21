import prismadb from "@/lib/prismadb"

interface GraphData {
    name: string;
    Quotes: number;
    Items: number;
}
export const getGraphData = async () => {
    const quotes = await prismadb.quote.findMany({
        where: {
            isDeleted: false
        },
        include: {
            quoteItems: {
                include: { product: true}
            }
        }
    })

    const monthlyQuotes: { [key: number]: number} = {};
    const monthlyQuoteItems: { [key: number]: number } = {};

    for (const quote of quotes) {
        const month = quote.createdAt.getMonth();
        let itemsPerOrder = 0;

        for (const item of quote.quoteItems) {
            itemsPerOrder += item.quantity;
        }

        monthlyQuotes[month] = (monthlyQuotes[month] || 0) + 1;
        monthlyQuoteItems[month] = (monthlyQuoteItems[month] || 0) + itemsPerOrder;
    }

    const graphData: GraphData[] = [
        { name: "Jan", Quotes: 1, Items: 15},
        { name: "Feb", Quotes: 2, Items: 27},
        { name: "March", Quotes: 0, Items: 0},
        { name: "April", Quotes: 0, Items: 0},
        { name: "May", Quotes: 0, Items: 0},
        { name: "Jun", Quotes: 0, Items: 0},
        { name: "July", Quotes: 0, Items: 0},
        { name: "Aug", Quotes: 0, Items: 0},
        { name: "Sep", Quotes: 0, Items: 0},
        { name: "Oct", Quotes: 0, Items: 0},
        { name: "Nov", Quotes: 0, Items: 0},
        { name: "Dec", Quotes: 0, Items: 0},
    ]

    for (const month in monthlyQuotes) {
        graphData[parseInt(month)].Quotes = monthlyQuotes[parseInt(month)]
    }
    for (const month in monthlyQuoteItems) {
        graphData[parseInt(month)].Items = monthlyQuoteItems[parseInt(month)]
    }


    return graphData;
}