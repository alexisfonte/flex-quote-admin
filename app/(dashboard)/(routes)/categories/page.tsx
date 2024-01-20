import CategoryClient from "./components/client";
import prismadb from "@/lib/prismadb";
import { CategoryColumn } from "./components/columns";
import { format } from "date-fns"

export const revalidate = 0;

async function CategoriesPage() {
  const categories = await prismadb.category.findMany({
    where: {
      isDeleted: false
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const formattedCategories: CategoryColumn[] = categories.map((category) => ({
    id: category.id,
    name: category.name,
    createdAt: format(category.createdAt, "M/d/yy")
  }))
  return (
    <>
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
            <CategoryClient data={formattedCategories}/>
        </div>
      </div>
    </>
  );
}
export default CategoriesPage;
