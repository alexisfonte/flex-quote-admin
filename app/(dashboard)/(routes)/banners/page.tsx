import BannerClient from "./components/client";
import prismadb from "@/lib/prismadb";
import { BannerColumn } from "./components/columns";
import { format } from "date-fns"

export const revalidate = 0;
async function BannersPage() {
  const banners = await prismadb.banner.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })

  const formattedBanners: BannerColumn[] = banners.map((banner) => ({
    id: banner.id,
    label: banner.label,
    imageURL: banner.imageURL,
    isArchived: banner.isArchived,
    createdAt: format(banner.createdAt, "M/d/yy")
  }))
  return (
    <>
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
            <BannerClient data={formattedBanners}/>
        </div>
      </div>
    </>
  );
}
export default BannersPage;