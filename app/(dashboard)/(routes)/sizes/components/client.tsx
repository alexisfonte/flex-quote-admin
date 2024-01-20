"use client"
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SizeColumn, columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";

type Props = {
  data: SizeColumn[]
};

function SizeClient({ data }: Props) {
    const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Sizes ({data.length})</h3>
          <p className="text-muted-foreground">
            Manage product sizes for your store.
          </p>
        </div>
        <Button onClick={() => router.push(`/sizes/new`)}>
            Add 
            <Plus className="ml-2 h-4 w-4"/>
        </Button>
      </div>
      <Separator/>
      <DataTable searchKey="value" columns={columns} data={data}/>
    </>
  );
}
export default SizeClient;
