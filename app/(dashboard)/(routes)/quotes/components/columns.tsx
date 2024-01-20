"use client";

import { DeliveryMethod, Status } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import CellAction from "./cell-action";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { formatUSAndInternationalNumber } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export type QuoteColumn = {
  id: string;
  quoteNum?: string;
  department: DeliveryMethod;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: Status;
  startDate: string;
  endDate: string;
  totalItems: number;
  submittedAt: string | Date;
  updatedAt: number;
};

export const columns: ColumnDef<QuoteColumn>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
  {
    id: "Quote Number",
    accessorKey: "quoteNum",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Quote" />;
    },
    cell: ({ row }) => (
      <div className="w-[80px]">{row.getValue("Quote Number")}</div>
    ),
  },
  {
    id: "Name",
    accessorKey: "name",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Name" />;
    },
    cell: ({ row }) => (
      <div className="flex max-w-[500px] truncate font-medium">
        {row.getValue("Name")}
      </div>
    ),
  },
  {
    id: "Company",
    accessorKey: "company",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Company" />;
    },
    cell: ({ row }) => (
      <div className="flex max-w-[500px] truncate font-medium">
        {row.getValue("Company")}
      </div>
    ),
  },
  {
    id: "Department",
    accessorKey: "department",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Department" />;
    },
    cell: ({ row }) => {
      const department = row.getValue("Department") as string;
      return (
        <Badge variant="outline">
          {department === "DELIVERY" ? "Delivery" : "Will Call"}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "Status",
    accessorKey: "status",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Status" />;
    },
    cell: ({ row }) => {
      const status = row.getValue("Status") as string;
      return (
        <Badge variant="outline" className="min-w-[80px] justify-center">
          {status.replace(/_/g, " ")}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "Start Date",
    accessorKey: "startDate",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Start Date" />;
    },
    cell: ({ row }) => (
      <div className="flex w-[60px] truncate font-medium">
        {row.getValue("Start Date")}
      </div>
    ),
  },
  {
    id: "End Date",
    accessorKey: "endDate",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="End Date" />;
    },
    cell: ({ row }) => (
      <div className="flex w-[60px] truncate font-medium">
        {row.getValue("End Date")}
      </div>
    ),
  },
  {
    id: "Items",
    accessorKey: "totalItems",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Items" />;
    },
    cell: ({ row }) => (
      <div className="flex max-w-[40px] justify-center truncate font-medium">
        {row.getValue("Items")}
      </div>
    ),
  },
  {
    id: "Submitted At",
    accessorKey: "submittedAt",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Submitted" />;
    },
    cell: ({ row }) => (
      <div className="flex justify-center truncate font-medium">
        {row.getValue("Submitted At") === "-"
          ? "-"
          : formatDistanceToNow(row.getValue("Submitted At"), {
              addSuffix: true,
            })}
      </div>
    ),
  },
];
