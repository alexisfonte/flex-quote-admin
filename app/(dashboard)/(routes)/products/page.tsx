import ProductClient from "./components/client";
import prismadb from "@/lib/prismadb";
import { ProductColumn } from "./components/columns";
import { format } from "date-fns"

export const revalidate = 0;
async function ProductsPage() {
  const products = await prismadb.product.findMany({
    where: {
      isDeleted: false
    },
    include: {
      images: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const formattedProducts: ProductColumn[] = products.map((product) => ({
    id: product.id,
    name: product.name,
    imageURL: product.images[0]?.url || "",
    barcode: product.barcode,
    isArchived: product.isArchived,
    isFeatured: product.isFeatured,
    createdAt: format(product.createdAt, "M/d/yy")
  }))
  return (
    <>
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
            <ProductClient data={formattedProducts}/>
        </div>
      </div>
    </>
  );
}
export default ProductsPage;
