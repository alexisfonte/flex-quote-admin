"use client";

import { useState } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckIcon, Trash } from "lucide-react";

import {
  Category,
  Manufacturer,
  Product,
  Size,
} from "@prisma/client";

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
import { Textarea } from "@/components/ui/textarea";

type Props = {
  initialData: Product | null;
  categories: Category[];
  manufacturers: Manufacturer[];
  sizes: Size[];
};

const formSchema = z.object({
  name: z.string().min(1, { message: "Product name is required" }),
  barcode: z.string().optional(),
  images: z.object({ url: z.string() }).array(),
  categoryId: z.string().min(1, { message: "Category is required" }),
  manufacturerId: z.string().optional(),
  sizeId: z.string().optional(),
  description: z.string().min(1),
  weight: z.string().optional(),
  dimensions: z.string().optional(),
  isFeatured: z.boolean().default(false).optional(),
  isArchived: z.boolean().default(false).optional(),
});

type ProductFormValues = z.infer<typeof formSchema>;

function ProductForm({
  initialData,
  categories,
  sizes,
  manufacturers,
}: Props) {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [categoryCheck, setCategoryCheck] = useState(false);
  const [productCheck, setProductCheck] = useState(false);
  const [defaultCheck, setDefaultCheck] = useState(true);

  const title = initialData ? "Edit product" : "Create product";
  const description = initialData ? "Edit a product" : "Create a product";
  const toastMessage = initialData ? "Product updated." : "Product created.";
  const action = initialData ? "Save changes" : "Create";

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          barcode: initialData.barcode || undefined,
          weight: initialData.weight || undefined,
          dimensions: initialData.dimensions || undefined,
          manufacturerId: initialData.manufacturerId || undefined,
          sizeId: initialData.sizeId || undefined,
        }
      : {
          name: "",
          categoryId: undefined,
          barcode: undefined,
          images: [],
          description: "",
          weight: "",
          dimensions: "",
          manufacturerId: undefined,
          sizeId: undefined,
          isFeatured: false,
          isArchived: false,
        },
  });

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(
        `/api/products/${params.productId}`
      );
      router.push(`/products`);
      router.refresh();
      toast.success("Product successfully deleted.");
    } catch (error) {
      toast.error("Error");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    const formData = {
      name: data.name,
      categoryId: data.categoryId,
      barcode: data.barcode,
      images: data.images,
      description: data.description,
      weight: data.weight,
      dimensions: data.dimensions,
      manufacturerId: data.manufacturerId === "" || undefined ? null : data.manufacturerId,
      sizeId: data.sizeId === "" || undefined ? null : data.sizeId,
      isFeatured: data.isFeatured,
      isArchived: data.isArchived,
    }
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(
          `/api/products/${initialData.id}`,
          formData
        );
      } else {
        await axios.post(
          `/api/products`,
          formData
        );
      }
      router.push(`/products`);
      router.refresh();
      toast.success(toastMessage);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        error.response?.data;
        toast.error( error.response?.data);
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
              onClick={() => router.push(`/products`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <p className="text-sm text-muted-foreground">
                Back to product list
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
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Background Image</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value.map((image) => image.url)}
                      disabled={loading}
                      onChange={(url) =>
                        field.onChange([...field.value, { url }])
                      }
                      onRemove={(url) =>
                        field.onChange([
                          ...field.value.filter(
                            (current) => current.url !== url
                          ),
                        ])
                      }
                      type="product"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Product Name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={loading}
                      placeholder="Product description..."
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
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight</FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading}
                        placeholder="Product weight"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dimensions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dimensions</FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading}
                        placeholder="Product dimensions"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Barcode</FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading}
                        placeholder="Product Barcode"
                        className="w-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem className="flex flex-col ">
                    <FormLabel>Category</FormLabel>
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
                                  form.setValue("categoryId", category.id);
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
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="manufacturerId"
                render={({ field }) => (
                  <FormItem className="flex flex-col ">
                    <FormLabel>Manufacturer *</FormLabel>
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
                              ? manufacturers.find(
                                  (manufacturer) =>
                                    manufacturer.id === field.value
                                )?.name
                              : "Select Manufacturer"}
                            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search manufacturers..."
                            className="h-9"
                          />
                          <CommandEmpty>No manufacturer found.</CommandEmpty>
                          <CommandGroup>
                            {manufacturers.map((manufacturer) => (
                              <CommandItem
                                value={manufacturer.name}
                                key={manufacturer.id}
                                onSelect={() => {
                                  form.setValue(
                                    "manufacturerId",
                                    manufacturer.id
                                  );
                                }}
                              >
                                {manufacturer.name}
                                <CheckIcon
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    manufacturer.id === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                            <CommandItem
                              key="default"
                              onSelect={() => {
                                form.setValue("manufacturerId", "");
                              }}
                            >
                              Select Manufacturer
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
                name="sizeId"
                render={({ field }) => (
                  <FormItem className="flex flex-col ">
                    <FormLabel>Size *</FormLabel>
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
                              ? sizes.find((size) => size.id === field.value)
                                  ?.value
                              : "Select Size"}
                            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search sizes..."
                            className="h-9"
                          />
                          <CommandEmpty>No size found.</CommandEmpty>
                          <CommandGroup>
                            {sizes.map((size) => (
                              <CommandItem
                                value={size.value}
                                key={size.id}
                                onSelect={() => {
                                  form.setValue("sizeId", size.id);
                                }}
                              >
                                {size.value}
                                <CheckIcon
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    size.id === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                            <CommandItem
                              key="default"
                              onSelect={() => {
                                form.setValue("sizeId", "");
                              }}
                            >
                              Select Size
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
            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Feature</FormLabel>
                    <FormDescription>
                      This item will be marked as featured.
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
            <FormField
              control={form.control}
              name="isArchived"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Archive</FormLabel>
                    <FormDescription>
                      This is product will not appear anywhere on the store.
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
                onClick={() => router.push(`/${params.orgSlug}/billboards`)}
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
export default ProductForm;
