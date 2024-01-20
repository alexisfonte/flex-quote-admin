"use client";

import { useState } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash } from "lucide-react";

import { Banner } from "@prisma/client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import ImageUpload from "@/components/ui/image-upload";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CaretSortIcon } from "@radix-ui/react-icons";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import axios from "axios";
import { toast } from "sonner";

type Props = {
  initialData: Banner | null;
};

const formSchema = z.object({
  label: z.string().min(1, { message: "Billboard label is required." }),
  imageURL: z.string().min(1, { message: "Background image is required." }),
  link: z.string().url(),
  isArchived: z.boolean().default(false).optional(),
});

type BannerFormValues = z.infer<typeof formSchema>;

function BannerForm({ initialData }: Props) {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const title = initialData ? "Edit banner" : "Create banner";
  const toastMessage = initialData
    ? "Banner updated."
    : "Banner created.";
  const action = initialData ? "Save changes" : "Add Banner";

  const form = useForm<BannerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      label: "",
      imageURL: "",
      link: "",
      isArchived: false,
    },
  });

  console.log(initialData)

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/banners/${params.bannerId}`)
      router.refresh();
      router.push(`/banners`)
      toast.success("Banner successfully deleted.")
    } catch (error) {
        toast.error("Error deleting banner")
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: BannerFormValues) => {
    try {
      setLoading(true)
      if (initialData){
          await axios.patch(`/api/banners/${initialData.id}`, data)
        } else {
            await axios.post(`/api/banners`, data)    
      }
      router.refresh();
      router.push(`/banners`)
      toast.success(toastMessage)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        (error.response?.data)
        toast.error(error.response?.data,);
      } else {
        toast.error("Error: There was a problem with your request.");
      }
    } finally {
      setLoading(false)
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
              onClick={() => router.push(`/banners`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <p className="text-sm text-muted-foreground">
                Back to banner list
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
              name="imageURL"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Background Image</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value ? [field.value] : []}
                      disabled={loading}
                      onChange={(url) => field.onChange(url)}
                      onRemove={() => field.onChange("")}
                      type="billboard"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label</FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading}
                        placeholder="Banner Label"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billboard Link</FormLabel>
                    <FormControl>
                        <FormItem className="items-center space-x-6 space-y-3">
                          <FormControl>
                            <Input
                              disabled={loading}
                              placeholder="Billboard Link"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="isArchived"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Archive</FormLabel>
                    <FormDescription>
                      This is billboard will not appear anywhere on the store.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
                onClick={() => router.push(`/banners`)}
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
export default BannerForm;
