"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";

import { AlertModal } from "@/components/modals/alert-modal";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

function InventoryForm() {
  const params = useParams();

  const [loading, setLoading] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [openReset, setOpenReset] = useState(false);

  const onUpdate = async () => {
    setOpenUpdate(false);
    const eventSource = new EventSource(
      `/api/inventory/update`
    );
    const progressToast = toast("Beginning Inventory Update", {
      duration: 600000,
    });

    eventSource.onmessage = (event: MessageEvent) => {
      const data = event.data as string;
      if (data.startsWith("{")) {
        const json = JSON.parse(data);
        toast.loading(`${json.title}: ${parseInt(json.progress)}%`, {
          id: progressToast,
        });
      } else if (data === "Inventory Update Complete") {
        toast.dismiss(progressToast);
        toast.success(data)
        eventSource.close();
      } else {
        toast.loading(data, { id: progressToast });
      }
    };

    eventSource.onerror = (error: Event) => {
      toast.dismiss(progressToast)
      toast.error("Unable to complete inventory update")
      console.log("Event Source Error:", error);
      eventSource.close();
    };
  };

  const onReset = async () => {
    try {
      setOpenReset(false);
      setLoading(true);
      const resetToast = toast.loading("Resetting Inventory")
      const res = await axios.delete(`/api/inventory/reset`)
      toast.dismiss(resetToast)
      toast.success("Inventory reset complete")
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        (error.response?.data)
        toast.error(error.response?.data);
      } else {
        toast.error("There was a problem completing your request.");
      }
    } finally {
      setLoading(false)
    }
  }
  return (
    <>
      <AlertModal
        isOpen={openUpdate}
        onClose={() => setOpenUpdate(false)}
        onConfirm={onUpdate}
        loading={loading}
      />
      <AlertModal
        isOpen={openReset}
        onClose={() => setOpenReset(false)}
        onConfirm={onReset}
        loading={loading}
      />
      <div>
        <div className="space-y-8">
          <div>
            <h3 className="mb-4 text-lg font-medium">Bulk Actions</h3>
            <div className="space-y-4">
              <div className="flex flex-row items-center justify-between rounded-lg border p-4 space-x-4">
                <div className="space-y-0.5">
                  <label
                    htmlFor="update"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Update Inventory
                  </label>
                  <p className="text-[0.8rem] text-muted-foreground">
                    Perform an immediate inventory update.
                  </p>
                  <p className="text-[0.8rem] text-muted-foreground">
                    Note: All category and model information will reflect the
                    information under the Website Cart category in your
                    organization&apos;s Flex5 database.
                  </p>
                </div>
                <Button
                  id="update"
                  type="button"
                  disabled={loading}
                  onClick={() => setOpenUpdate(true)}
                >
                  Update
                </Button>
              </div>
              <div className="flex flex-row items-center justify-between rounded-lg border p-4 space-x-4">
                <div className="space-y-0.5">
                  <label
                    htmlFor="reset"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Reset Inventory
                  </label>
                  <p className="text-[0.8rem] text-muted-foreground">
                    Delete all categories, products, sizes, and manufacturers.
                    Quotes and billboards will not be affected.
                  </p>
                </div>
                <Button
                  id="reset"
                  type="button"
                  disabled={loading}
                  variant="destructive"
                  onClick={() => setOpenReset(true)}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default InventoryForm;
