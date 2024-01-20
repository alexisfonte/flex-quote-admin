"use client";

import { ColumnDef } from "@tanstack/react-table";
import CellAction from "./cell-action";

export type SizeColumn = {
  id: string;
  value: string;
  createdAt: string;
};

export const columns: ColumnDef<SizeColumn>[] = [
  {
    accessorKey: "value",
    header: ({ column }) => {
      return (
        <div className="text-center">
            Size
        </div>
      );
    },
    cell: ({ row }) => {
      const value: string = row.getValue("value");
      return <div className="flex items-center justify-center">{value}</div>;
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <div className="text-center">
            Created
        </div>
      );
    },
    cell: ({ row }) => {
      const date: string = row.getValue("createdAt");
      return <div className="flex items-center justify-center">{date}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <CellAction data={row.original}/>
    ),
  },

];
