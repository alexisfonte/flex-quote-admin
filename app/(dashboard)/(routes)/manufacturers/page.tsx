import ManufacturerClient from "./components/client";
import prismadb from "@/lib/prismadb";
import { ManufacturerColumn } from "./components/columns";
import { format } from "date-fns"

export const revalidate = 0;
async function ManufacturersPage() {
  const manufacturers = await prismadb.manufacturer.findMany({
    where: {
      isDeleted: false
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const formattedManufacturers: ManufacturerColumn[] = manufacturers.map((manufacturer) => ({
    id: manufacturer.id,
    name: manufacturer.name,
    country: manufacturer.country,
    createdAt: format(manufacturer.createdAt, "M/d/yy")
  }))
  return (
    <>
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
            <ManufacturerClient data={formattedManufacturers}/>
        </div>
      </div>
    </>
  );
}
export default ManufacturersPage;
