import { Separator } from "@/components/ui/separator";
import InventoryForm from "./components/inventory-form";
import { FormLabel } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";

const SettingsInventoryPage = async () => {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Inventory</h3>
        <p className="text-sm text-muted-foreground">
          Manage your store&apos;s inventory.
        </p>
      </div>
      <Separator />
      <InventoryForm />
    </div>
  );
};
export default SettingsInventoryPage;
