import prismadb from "@/lib/prismadb";
import BannerForm from "./components/banner-form";

type Props = {
  params: {
    bannerId: string;
  };
};

async function BannerPage({ params }: Props) {
  const banner = await prismadb.banner.findUnique({
    where: {
      id: params.bannerId,
    },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BannerForm initialData={banner}/>
      </div>
    </div>
  );
}
export default BannerPage;
