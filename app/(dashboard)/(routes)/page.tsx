import { getGraphData } from "@/actions/get-graph-data";
import Overview from "@/components/overview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import prismadb from "@/lib/prismadb";
import { LockKeyholeIcon, SpeakerIcon, StarIcon } from "lucide-react";

async function DashboardPage() {
  const totalProducts = (
    await prismadb.product.findMany({
      where: {
        isDeleted: false,
      },
    })
  ).length;
  const totalFeaturedItems = (
    await prismadb.product.findMany({
      where: {
        isDeleted: false,
        isFeatured: true
      },
    })
  ).length;
  const totalArchivedItems = (
    await prismadb.product.findMany({
      where: {
        isDeleted: false,
        isArchived: true,
      },
    })
  ).length;

  const graphData = await getGraphData();
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading title="Dashboard" description="" />
        <Separator />
        <div className="grid gap-4 grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Products
              </CardTitle>
              <SpeakerIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Featured Products
              </CardTitle>
              <StarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalFeaturedItems}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Archived Products
              </CardTitle>
              <LockKeyholeIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalArchivedItems}</div>
            </CardContent>
          </Card>
        </div>
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>
              Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview data={graphData}/>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
export default DashboardPage;
