"use client";

import { ColumnDef } from "@tanstack/react-table";
import CellAction from "./cell-action";

export type CategoryColumn = {
  id: string;
  name: string;
  createdAt: string;
};

export const columns: ColumnDef<CategoryColumn>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <div className="text-center">
            Name
        </div>
      );
    },
    cell: ({ row }) => {
      const name: string = row.getValue("name");
      return <div className="flex items-center justify-center">{name}</div>;
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
