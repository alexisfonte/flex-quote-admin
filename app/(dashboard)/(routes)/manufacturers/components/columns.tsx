"use client";

import { ColumnDef } from "@tanstack/react-table";
import CellAction from "./cell-action";

export type ManufacturerColumn = {
  id: string;
  name: string;
  country: string | null;
  createdAt: string;
};

export const columns: ColumnDef<ManufacturerColumn>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return <div className="text-center">Manufacturer</div>;
    },
    cell: ({ row }) => {
      const name: string = row.getValue("name");
      return <div className="flex items-center justify-center">{name}</div>;
    },
  },
  {
    accessorKey: "country",
    header: ({ column }) => {
      return <div className="text-center">Country</div>;
    },
    cell: ({ row }) => {
      const country: string = row.getValue("country");
      return <div className="flex items-center justify-center">{country}</div>;
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return <div className="text-center">Created</div>;
    },
    cell: ({ row }) => {
      const date: string = row.getValue("createdAt");
      return <div className="flex items-center justify-center">{date}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
