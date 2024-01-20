import prismadb from "@/lib/prismadb";
import CategoryForm from "./components/category-form";

type Props = {
  params: {
    categoryId: string;
  };
};

async function CategoryPage({ params }: Props) {
  const category = await prismadb.category.findUnique({
    where: {
      id: params.categoryId,
      isDeleted: false
    },
  });


  const banners = await prismadb.banner.findMany({
    where: {
      isArchived: false
    }
  })

  const categories = await prismadb.category.findMany({
    where: {
      isDeleted: false,
      NOT: {
        id: params.categoryId,
      },
    }
  })

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CategoryForm initialData={category} banners={banners} categories={categories}/>
      </div>
    </div>
  );
}
export default CategoryPage;
