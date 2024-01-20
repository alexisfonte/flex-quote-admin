import SizeClient from "./components/client";
import prismadb from "@/lib/prismadb";
import { SizeColumn } from "./components/columns";
import { format } from "date-fns"

export const revalidate = 0
async function SizesPage() {
  const sizes = await prismadb.size.findMany({
    where: {
      isDeleted: false
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const formattedSizes: SizeColumn[] = sizes.map((size) => ({
    id: size.id,
    value: size.value,
    createdAt: format(size.createdAt, "M/d/yy")
  }))
  return (
    <>
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
            <SizeClient data={formattedSizes}/>
        </div>
      </div>
    </>
  );
}
export default SizesPage;
