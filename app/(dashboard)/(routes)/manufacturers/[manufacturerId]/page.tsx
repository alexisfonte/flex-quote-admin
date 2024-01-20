import prismadb from "@/lib/prismadb";
import ManufacturerForm from "./components/manufacturer-form";

type Props = {
  params: {
    manufacturerId: string;
  };
};

async function ManufactuererPage({ params }: Props) {
  const manufacturer = await prismadb.manufacturer.findUnique({
    where: {
      id: params.manufacturerId,
      isDeleted: false
    },
  });


  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ManufacturerForm initialData={manufacturer} />
      </div>
    </div>
  );
}
export default ManufactuererPage;
