"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import Image from "next/image";
import { Dot } from "lucide-react";
import { cn } from "@/lib/utils";

export type BannerColumn = {
  id: string;
  label: string;
  imageURL: string;
  isArchived: boolean;
  createdAt: string;
};

export const columns: ColumnDef<BannerColumn>[] = [
  {
    accessorKey: "imageURL",
    header: () => <div className="text-center">Image</div>,
    cell: ({ row }) => {
      const url: string = row.getValue("imageURL");
      return (
        <div className="flex justify-center ">
          <div className="aspect-[3.88/1] relative rounded-md overflow-hidden h-14 items-center">
            <Image src={url} fill className="object-cover" alt="Image" />
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "label",
    header: ({ column }) => {
      return <div className="text-center">Label</div>;
    },
    cell: ({ row }) => {
      const label: string = row.getValue("label");
      return <div className="flex items-center justify-center">{label}</div>;
    },
  },
  {
    accessorKey: "isArchived",
    header: ({ column }) => {
      return <div className="text-center">Status</div>;
    },
    cell: ({ row }) => {
      const archived: string = row.getValue("isArchived");
      return (
        <div
          className={cn(
            "flex items-center justify-center -ml-6",
            archived ? "text-red-600" : "text-green-600"
          )}
        >
          <Dot className="h-8 w-8" />
          {archived ? "Archived" : "Active"}
        </div>
      );
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
