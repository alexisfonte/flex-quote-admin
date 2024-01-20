"use client";

import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Mail, MailOpen, Send, Trash } from "lucide-react";
import { Quote } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import { AlertModal } from "@/components/modals/alert-modal";
import { toast } from "sonner";

interface DataTableViewOptionsProps<TData extends Quote> {
  table: Table<TData>;
}

export function DataTableRowSelectionOptions<TData extends Quote>({
  table,
}: DataTableViewOptionsProps<TData>) {
  const rows = table.getSelectedRowModel().rows.map((row) => row.original);
  const router = useRouter();
  const [openMarkAsRead, setOpenMarkAsRead] = useState(false);
  const [openMarkAsUnRead, setOpenMarkAsUnRead] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [loading, setLoading] = useState(false);

  const onConfirmMarkAsRead = async () => {
    try {
      setLoading(true);
    rows.forEach(async (row) => {
        await axios.patch(`/api/quotes/${row.id}`, {
          status: "READ"
        });
      })
      toast.success("Quotes marked as read.");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setOpenMarkAsRead(false);
      setLoading(false);
    }
  };

  const onConfirmMarkAsUnRead = async () => {
    try {
      setLoading(true);
    rows.forEach(async (row) => {
        await axios.patch(`/api/quotes/${row.id}`, {
          status: "NEW"
        });
      })
      toast.success("Quotes marked as unread.");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setOpenMarkAsUnRead(false);
      setLoading(false);
    }
  };

  const onConfirmDelete = async () => {
    try {
      setLoading(true);
    rows.forEach(async (row) => {
        await axios.delete(`/api/quotes/${row.id}`);
      })
      toast.success("Quotes deleted.");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setOpenDelete(false);
      setLoading(false);
    }
  };
  
  return (
    <>
     <AlertModal
        isOpen={openMarkAsRead}
        onClose={() => setOpenMarkAsRead(false)}
        onConfirm={onConfirmMarkAsRead}
        loading={loading}
      />
     <AlertModal
        isOpen={openMarkAsUnRead}
        onClose={() => setOpenMarkAsUnRead(false)}
        onConfirm={onConfirmMarkAsUnRead}
        loading={loading}
      />
     <AlertModal
        isOpen={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={onConfirmDelete}
        loading={loading}
      />
      <div className="flex flex-1 items-center space-x-2">
        <Button variant="outline" size="icon" className="ml-auto h-8 flex" onClick={() => setOpenMarkAsRead(true)}>
          <MailOpen className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="ml-auto h-8 flex" onClick={() => setOpenMarkAsUnRead(true)}>
          <Mail className="h-4 w-4" />
        </Button>
        {/* import to flex disabled for demo site */}
        {/* <Button variant="outline" size="icon" className="ml-auto h-8 flex">
          <Send className="h-4 w-4" />
        </Button> */}
        <Button
          variant="destructive"
          size="icon"
          className="ml-auto h-8 flex"
          onClick={() => setOpenDelete(true)}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}
