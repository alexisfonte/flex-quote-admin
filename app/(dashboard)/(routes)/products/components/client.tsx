"use client"
import { useRouter } from "next/navigation";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ProductColumn, columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";

type Props = {
  data: ProductColumn[]
};

function ProductClient({ data }: Props) {
    const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Products ({data.length})</h3>
          <p className="text-muted-foreground">
            Manage inventory items.
          </p>
        </div>
        <Button onClick={() => router.push(`/products/new`)}>
            Add 
            <Plus className="ml-2 h-4 w-4"/>
        </Button>
      </div>
      <Separator/>
      <DataTable searchKey="name" columns={columns} data={data} />
    </>
  );
}
export default ProductClient;
