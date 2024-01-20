"use client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { Dot } from "lucide-react";
import { cn } from "@/lib/utils";
import CellAction from "./cell-action";

export type ProductColumn = {
  id: string;
  name: string;
  imageURL: string;
  barcode: string | null;
  isArchived: boolean;
  isFeatured: boolean;
  createdAt: string;
};

export const columns: ColumnDef<ProductColumn>[] = [
  {
    accessorKey: "imageURL",
    header: () => <div className="text-center">Image</div>,
    cell: ({ row }) => {
      const url: string = row.getValue("imageURL");
      return (
        <div className="flex justify-center ">
          <div className="aspect-square relative rounded-md overflow-hidden h-14 items-center">
            <Image src={url} fill className="object-cover" alt="Image" />
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "barcode",
    header: ({ column }) => {
      return (
        <div className="text-center">
            Barcode
        </div>
      );
    },
    cell: ({ row }) => {
      const barcode: string = row.getValue("barcode");
      return <div className="flex items-center justify-center">{barcode}</div>;
    },
  },
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
    accessorKey: "isFeatured",
    header: ({ column }) => {
      return (
        <div className="text-center">
            Featured
        </div>
      );
    },
    cell: ({ row }) => {
      const featured: string = row.getValue("isFeatured");
      return (
        <div
          className={cn(
            "flex items-center justify-center -ml-6",
            featured ? "text-green-600" : "text-yellow-600"
          )}
        >
          <Dot className="h-8 w-8" />
          {featured ? "Featured" : "Not Featured"}
        </div>
      );
    },
  },
  {
    accessorKey: "isArchived",
    header: ({ column }) => {
      return (
        <div className="text-center">
            Status
        </div>
      );
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
