import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": `${process.env.STORE_URL}`,
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};


export async function GET(
  req: Request
) {
  try {
    const { searchParams } = new URL(req.url);
    const searchTerm = searchParams.get("searchTerm") || undefined;
    const categoryId = searchParams.get("categoryId") || undefined;
    const manufacturerIds = (searchParams.getAll("manufacturerId").length !== 0 ? searchParams.getAll("manufacturerId") : undefined);
    const sizeIds = (searchParams.getAll("sizeId").length !== 0 ? searchParams.getAll("sizeId") : undefined);
    const isFeatured = searchParams.get("isFeatured");

    async function getCategoryAndChildren(categoryId: string) {
      const category = await prismadb.category.findUnique({
        where: {
          id: categoryId,
          isDeleted: false
        },
        select: {
          id: true,
          children: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!category) {
        return [];
      }

      const result = [category.id];

      if (category.children) {
        for (const child of category.children) {
          const childCategories = await getCategoryAndChildren(child.id);
          result.push(...childCategories);
        }
      }

      return result;
    }

    async function getManufacturersWithCount(
      categories: string[] | undefined
    ) {
      let products = await prismadb.product.findMany({
        where: {
          categoryId: (categories ? { in: categories } : categories),
          isFeatured: isFeatured ? true : undefined,
          isArchived: false,
          isDeleted: false
        },
        include: {
          images: true,
          category: true,
          manufacturer: true,
          size: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (searchTerm){
        products = await prismadb.product.findMany({
          where: {
            categoryId: (categories ? { in: categories } : categories),
            isFeatured: isFeatured ? true : undefined,
            isArchived: false,
            isDeleted: false,
            OR: [
              {
                name: {
                  contains: searchTerm,
                },
              },
              {
                description: {
                  contains: searchTerm,
                },
              },
              {
                size: {
                  value: {
                    contains: searchTerm,
                  },
                },
              },
              {
                manufacturer: {
                  name: {
                    contains: searchTerm
                  }
                }
              },
              {
                manufacturer: {
                  country: {
                    contains: searchTerm
                  }
                }
              },
              {
                weight: {
                  contains: searchTerm
                }
              },
              {
                dimensions: {
                  contains: searchTerm
                }
              },
              {
                category: {
                  name: {
                    contains: searchTerm
                  }
                }
              }
            ],
          },
          include: {
            images: true,
            category: true,
            manufacturer: true,
            size: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        });
      }

      const manufacturerCount: {
        [key: string]: { id: string; name: string; count: number };
      } = {};

      for (const product of products) {
        if (product.manufacturer) {
          const { id, name } = product.manufacturer;

          if (!manufacturerCount[id]) {
            manufacturerCount[id] = {
              id,
              name,
              count: 0,
            };
          }

          manufacturerCount[id].count++;
        }
      }

      const result = Object.values(manufacturerCount);
      return result;
    }

    async function getSizesWithCount(
      categories: string[] | undefined
    ) {
      let products = await prismadb.product.findMany({
        where: {
          categoryId: (categories ? { in: categories } : categories),
          isFeatured: isFeatured ? true : undefined,
          isArchived: false,
          isDeleted: false
        },
        include: {
          images: true,
          category: true,
          manufacturer: true,
          size: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (searchTerm) {
        products = await prismadb.product.findMany({
          where: {
            categoryId: (categories ? { in: categories } : categories),
            isFeatured: isFeatured ? true : undefined,
            isArchived: false,
            isDeleted: false,
            OR: [
              {
                name: {
                  contains: searchTerm,
                },
              },
              {
                description: {
                  contains: searchTerm,
                },
              },
              {
                size: {
                  value: {
                    contains: searchTerm,
                  },
                },
              },
              {
                manufacturer: {
                  name: {
                    contains: searchTerm
                  }
                }
              },
              {
                manufacturer: {
                  country: {
                    contains: searchTerm
                  }
                }
              },
              {
                weight: {
                  contains: searchTerm
                }
              },
              {
                dimensions: {
                  contains: searchTerm
                }
              },
              {
                category: {
                  name: {
                    contains: searchTerm
                  }
                }
              }
            ],
          },
          include: {
            images: true,
            category: true,
            manufacturer: true,
            size: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        });
      }

      const sizeCount: {
        [key: string]: { id: string; name: string; count: number };
      } = {};

      for (const product of products) {
        if (product.size) {
          const { id, value } = product.size;

          if (!sizeCount[id]) {
            sizeCount[id] = {
              id,
              name: value,
              count: 0,
            };
          }

          sizeCount[id].count++;
        }
      }

      const result = Object.values(sizeCount);
      return result;
    }

    const categories = (categoryId ? await getCategoryAndChildren(categoryId) : undefined)

    const products = await prismadb.product.findMany({
      where: {
        categoryId: (categories ? { in: categories } : categories),
        manufacturerId: (manufacturerIds ? {in: manufacturerIds} : manufacturerIds),
        sizeId: (sizeIds ? {in: sizeIds} : sizeIds),
        isFeatured: isFeatured ? true : undefined,
        isArchived: false,
        isDeleted: false,
        OR: [
          {
            name: {
              contains: searchTerm,
            },
          },
          {
            description: {
              contains: searchTerm,
            },
          },
          {
            size: {
              value: {
                contains: searchTerm,
              },
            },
          },
          {
            manufacturer: {
              name: {
                contains: searchTerm
              }
            }
          },
          {
            manufacturer: {
              country: {
                contains: searchTerm
              }
            }
          },
          {
            weight: {
              contains: searchTerm
            }
          },
          {
            dimensions: {
              contains: searchTerm
            }
          },
          {
            category: {
              name: {
                contains: searchTerm
              }
            }
          }
        ],
      },
      include: {
        images: true,
        category: true,
        manufacturer: true,
        size: true,
      },
      orderBy: [
        {
          isFeatured : "desc"
        },
        {
          category: {
            globalSortOrdinal: "asc"
          }
        },
        {
        createdAt: "desc"
        }
    ],
    });

    const manufacturers = await getManufacturersWithCount(categories);
    const sizes = await getSizesWithCount(categories);

    return NextResponse.json({ products, manufacturers, sizes }, { headers: corsHeaders });
  } catch (error) {
    console.log(`[PRODUCTS_GET]`, error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(
  req: Request
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const {
      name,
      description,
      weight,
      dimensions,
      manufacturerId,
      categoryId,
      sizeId,
      images,
      isFeatured,
     isArchived, barcode } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!description) {
      return new NextResponse("Description is required", { status: 400 });
    }

    if (!images || !images.length) {
      return new NextResponse("Images are required", { status: 400 });
    }

    if (!categoryId) {
      return new NextResponse("Category id is required", { status: 400 });
    }

    const product = await prismadb.product.create({
      data: {
        name,
        description,
        weight,
        dimensions,
        manufacturerId,
        categoryId,
        sizeId,
        isFeatured,
        isArchived,
        barcode,
        images: {
          createMany: {
            data: [...images.map((image: { url: string }) => image)],
          },
        },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCT_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
