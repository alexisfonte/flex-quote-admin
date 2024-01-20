"use client";

import { QuoteColumn, columns } from "./columns";
import { Separator } from "@/components/ui/separator";
import { QuoteTable } from "@/components/quote-table";
import { Loader } from "lucide-react";

type Props = {
  data: QuoteColumn[];
};

function QuotesClient({ data }: Props) {
  const filters = [
    {
      id: "Department",
      options: [
        {
        value: "DELIVERY",
        label: "Delivery",
        icon: Loader
      },
        {
        value: "PICKUP",
        label: "Will Call",
        icon: Loader
      },
    ]
    },
    {
      id: "Status",
      options: [
        {
          value: "PENDING",
          label: "PENDING",
          icon: Loader
        },
        {
          value: "NEW",
          label: "NEW",
          icon: Loader
        },
        {
          value: "READ",
          label: "READ",
          icon: Loader
        },
        {
          value: "IMPORTED",
          label: "IMPORTED",
          icon: Loader
        },
        {
          value: "NEW_NOTE",
          label: "NEW NOTE",
          icon: Loader
        }
      ]
    }
  ]

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">
            Quotes ({data.length})
          </h3>
        </div>
      </div>
      <Separator />
      <QuoteTable columns={columns} data={data} facetedFilters={filters}/>
    </>
  );
}

export default QuotesClient;
