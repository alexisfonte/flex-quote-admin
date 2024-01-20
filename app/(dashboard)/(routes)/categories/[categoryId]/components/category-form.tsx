"use client";

import { useState } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckIcon, Trash, X } from "lucide-react";

import { Banner, Category } from "@prisma/client";

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
import { Popover } from "@radix-ui/react-popover";
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  initialData: Category | null;
  banners: Banner[];
  categories: Category[];
};

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  bannerId: z.string().optional(),
  parentId: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof formSchema>;

function CategoryForm({
  initialData,
  banners,
  categories,
}: Props) {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const title = initialData ? "Edit category" : "Create category";
  const toastMessage = initialData ? "Category updated." : "Category created.";
  const action = initialData ? "Save changes" : "Create";

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          bannerId: initialData.bannerId || undefined,
          parentId: initialData.parentId || undefined,
        }
      : {
          name: "",
          bannerId: undefined,
          parentId: undefined,
        },
  });

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(
        `/api/categories/${params.categoryId}`
      );
      router.push(`/categories`);
      router.refresh();
      toast.success("Category successfully deleted.");
    } catch (error) {
      toast.error("Error");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CategoryFormValues) => {
    const formData = {
      name: data.name,
      bannerId: data.bannerId === "" || undefined ? null : data.bannerId,
      parentId: data.parentId === "" || undefined ? null : data.parentId
    }
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(
          `/api/categories/${initialData.id}`,
          formData
        );
      } else {
        await axios.post(
          `/api/categories`,
          formData
        );
      }
      router.push(`/categories`);
      router.refresh();
      toast.success(toastMessage);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        error.response?.data;
        toast.error(error.response?.data);
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
              onClick={() => router.push(`/categories`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <p className="text-sm text-muted-foreground">
                Back to category list
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Category Name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem className="flex flex-col ">
                    <FormLabel>Parent Category*</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-[200px] justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? categories.find(
                                    (category) => category.id === field.value
                                  )?.name
                                : "Select Category"}
                              <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search categories..."
                            className="h-9"
                          />
                          <CommandEmpty>No category found.</CommandEmpty>
                          <CommandGroup>
                            {categories.map((category) => (
                              <CommandItem
                                value={category.name}
                                key={category.id}
                                onSelect={() => {
                                  form.setValue("parentId", category.id);
                                }}
                              >
                                {category.name}
                                <CheckIcon
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    category.id === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                            <CommandItem
                                key="default"
                                onSelect={() => {
                                  form.setValue("parentId", "");
                                }}
                              >
                                Select Category
                                <CheckIcon
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                   "" === field.value
                                   ? "opacity-100"
                                   : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>* Optional</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bannerId"
                render={({ field }) => (
                  <FormItem className="flex flex-col ">
                    <FormLabel>Billboard *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-[200px] justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? banners.find(
                                  (banner) => banner.id === field.value
                                )?.label
                              : "Select Billboard"}
                            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search billboards..."
                            className="h-9"
                          />
                          <CommandEmpty>No billboard found.</CommandEmpty>
                          <CommandGroup>
                            {banners.map((banner) => (
                              <CommandItem
                                value={banner.label}
                                key={banner.id}
                                onSelect={() => {
                                  form.setValue("bannerId", banner.id);
                                }}
                              >
                                {banner.label}
                                <CheckIcon
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    banner.id === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                            <CommandItem
                                key="default"
                                onSelect={() => {
                                  form.setValue("bannerId", "");
                                }}
                              >
                                Select Billboard
                                <CheckIcon
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    "" === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>* Optional</FormDescription>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex items-center justify-between">
              <Button
                disabled={loading}
                variant="outline"
                onClick={() => router.push(`/categories`)}
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
export default CategoryForm;
