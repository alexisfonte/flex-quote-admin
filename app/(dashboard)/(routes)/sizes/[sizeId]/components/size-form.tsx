"use client";

import { useState } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash } from "lucide-react";

import { Size } from "@prisma/client";

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
  initialData: Size | null;
};

const formSchema = z.object({
  value: z.string().min(1, { message: "Size is required." }),
});

type SizeFormValues = z.infer<typeof formSchema>;

function SizeForm({
  initialData
}: Props) {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const title = initialData ? "Edit size" : "Create size";
  const toastMessage = initialData ? "Size updated." : "Size created.";
  const action = initialData ? "Save changes" : "Create";

  const form = useForm<SizeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          ...initialData,
        }
      : {
          value: "",
        },
  });

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(
        `/api/sizes/${params.sizeId}`
      );
      router.push(`/sizes`);
      router.refresh();
      toast.success("Size successfully deleted.");
    } catch (error) {
      toast.error("Error");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: SizeFormValues) => {
    const formData = {
      value: data.value
    }
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(
          `/api/sizes/${initialData.id}`,
          formData
        );
      } else {
        await axios.post(
          `/api/sizes`,
          formData
        );
      }
      router.push(`/sizes`);
      router.refresh();
      toast.success(toastMessage,);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        error.response?.data;
        toast.error(error.response?.data,);
      } else {
        toast.error("There was a problem with your request.");
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
              onClick={() => router.push(`/sizes`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <p className="text-sm text-muted-foreground">
                Back to size list
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
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Size</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Size Name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-between">
              <Button
                disabled={loading}
                variant="outline"
                onClick={() => router.push(`/sizes`)}
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
export default SizeForm;
