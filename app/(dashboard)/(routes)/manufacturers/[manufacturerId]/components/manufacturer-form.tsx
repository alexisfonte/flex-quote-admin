"use client";

import { useState } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash } from "lucide-react";

import { Manufacturer } from "@prisma/client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { toast } from "sonner";

type Props = {
  initialData: Manufacturer | null;
};

const formSchema = z.object({
  name: z.string().min(1, { message: "Manufacturer name is required." }),
  country: z.string().optional(),
});

type ManufacturerFormValues = z.infer<typeof formSchema>;

function ManufacturerForm({ initialData }: Props) {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const title = initialData ? "Edit manufacturer" : "Create manufacturer";
  const description = initialData
    ? "Edit a manufacturer"
    : "Create a manufacturer";
  const toastMessage = initialData
    ? "Manufacturer updated."
    : "Manufacturer created.";
  const action = initialData ? "Save changes" : "Create";

  const form = useForm<ManufacturerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          country: initialData.country || undefined,
        }
      : {
          name: "",
          country: "",
        },
  });

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(
        `/api/manufacturers/${params.manufacturerId}`
      );
      router.push(`/manufacturers`);
      router.refresh();
      toast.success("Manufacturer successfully deleted.",
      );
    } catch (error) {
      toast.error("Error");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ManufacturerFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(
          `/api/manufacturers/${initialData.id}`,
          data
        );
      } else {
        await axios.post(
          `/api/manufacturers`,
          data
        );
      }
      router.push(`/manufacturers`);
      router.refresh();
      toast.success(toastMessage,
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        error.response?.data;
        toast.error(error.response?.data);
      } else {
        toast.error("There was a problem with your request.",
        );
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between">
          <div className="flex gap-x-4">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => router.push(`/manufacturers`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <p className="text-sm text-muted-foreground">
                Back to manufacturer list
              </p>
              <h3 className="text-lg font-medium">{title}</h3>
            </div>
          </div>
          {initialData && (
            <Button variant="destructive" size="icon" onClick={onDelete}>
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Separator />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manufacturer</FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading}
                        placeholder="Manufacturer Name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading}
                        placeholder="Manufacturer Country"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center justify-between">
              <Button
                disabled={loading}
                variant="outline"
                onClick={() => router.push(`/manufacturers`)}
              >
                Cancel
              </Button>
              <Button disabled={loading} type="submit">
                {action}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
export default ManufacturerForm;
