import prismadb from "@/lib/prismadb";
import ProductForm from "./components/product-form";

type Props = {
  params: {
    productId: string;
  };
};

async function ProductPage({ params }: Props) {
  const product = await prismadb.product.findUnique({
    where: {
      id: params.productId,
      isDeleted: false
    },
    include: {
      images: true
    }
  });

  const categories = await prismadb.category.findMany({
    where: {
      isDeleted: false
    }
  })
  
  const sizes = await prismadb.size.findMany({
    where: {
      isDeleted: false
    }
  })
  
  const manufacturers = await prismadb.manufacturer.findMany({
    where: {
      isDeleted: false
    }
  })

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductForm 
        initialData={product} 
        categories={categories}
        sizes={sizes}
        manufacturers={manufacturers}
        />
      </div>
    </div>
  );
}
export default ProductPage;
