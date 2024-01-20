"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ApiList } from "@/components/ui/api-list";

import { columns, BannerColumn } from "./columns";

interface BannerClientProps {
  data: BannerColumn[];
}

const BannerClient: React.FC<BannerClientProps> = ({
  data
}) => {
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={`Banners (${data.length})`} description="Manage promotional banners for your store" />
        <Button onClick={() => router.push(`/banners/new`)}>
          <Plus className="mr-2 h-4 w-4" /> Add New
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="label" columns={columns} data={data} />
      <Heading title="API" description="API Calls for Banners" />
      <Separator />
      <ApiList entityName="banners" entityIdName="bannerId" />
    </>
  );
};

export default BannerClient;
