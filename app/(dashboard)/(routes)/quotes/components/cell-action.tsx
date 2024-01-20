"use client";

import { useRouter } from "next/navigation";
import { QuoteColumn } from "./columns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Copy, List, MoreHorizontal, Trash } from "lucide-react";
import { toast } from "sonner";
import { AlertModal } from "@/components/modals/alert-modal";
import { useState } from "react";
import axios from "axios";

interface CellActionProps {
  data: QuoteColumn;
}

function CellAction({ data }: CellActionProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const onConfirm = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/quotes/${data.id}`);
      toast.success("Quote deleted.");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setOpen(false);
      setLoading(false);
    }
  };
  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => {
              navigator.clipboard.writeText(data.id);
              toast.success("Quote Id copied to clipboard");
            }}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy ID
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(`/quotes/${data.id}`)}>
            <List className="mr-2 h-4 w-4" />
            View Quote
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

export default CellAction;
