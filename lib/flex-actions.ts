import { ParseResult, parse } from "papaparse";
import prismadb from "./prismadb";
import {
  Manufacturer,
  Product,
  Size,
  Image,
  Quote
} from "@prisma/client";
import qs from "query-string";
export interface Notify {
  log: (message: string) => void;
  json: (obj: any) => void;
  error: (error: Error | any) => void;
  close: () => void;
}

interface CredentialVerificationProps {
  flexAPIKey: string;
  reportId: string;
  flexURL: string;
}

interface ParsedItem {
  "Category Id": string;
  "Category Name": string;
  "Parent Group Id": string;
  "Category Ordinal": string;
  "Category Global Ordinal": string;
  "Item Id": string;
  Name: string;
  "Short Name": string;
  "Short Hand": string;
  "Narrative Description": string;
  Manufacturer: string;
  "Manufacturer Country": string;
  Weight: string;
  Dimensions: string;
  "Image URL": string;
  isFeatured: string;
  isArchived: string;
  Size: string;
  "Item Barcode": string;
  "Item Ordinal": string;
  "Display String": string;
}

export async function verifyCredentials({
  flexAPIKey,
  reportId,
  flexURL,
}: CredentialVerificationProps) {
  const url = `${flexURL}/f5/api/report/custom-report`;
  const response = await fetch(url, {
    headers: { "X-Auth-Token": flexAPIKey },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(`Invalid API Key`);
    }
    throw new Error(
      `Failed to verify credentials: ${response.status} - ${response.statusText}`
    );
  }

  const data: { id: string; name: string }[] = await response.json();
  let validReportId = false;

  for (const report of data) {
    if (report.id === reportId) {
      validReportId = true;
    }
  }

  return validReportId;
}

export async function updateInventory(notify: Notify) {
  notify.log("Starting Inventory Update");
  const inventoryData = await fetchInventoryReport(notify);
  const inventory: ParsedItem[] = await parseInventoryFromReport(
    inventoryData,
    notify
  );
  await update(inventory, notify);
}

async function fetchInventoryReport(
  notify: Notify
): Promise<string> {
  const url = `${process.env.FLEX_URL}/f5/api/report/generate/${process.env.REPORT_ID}?parameterSubmission=true&REPORT_FORMAT=csv&REPORT_ORIENTATION=portrait`;

  try {
    notify.log("Fetching Inventory Report");
    const response = await fetch(url, {
      headers: { "X-Auth-Token": `${process.env.FLEX_API_KEY}` },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch report: ${response.status} - ${response.statusText}`
      );
    }

    notify.log("Reading Report");
    const inventoryData = await response.text();
    const data = Buffer.from(inventoryData, "base64").toString();
    return data;
  } catch (error) {
    notify.error(error);
    throw new Error("Failed to fetch inventory report");
  }
}

async function parseInventoryFromReport(
  csvData: string,
  notify: Notify
): Promise<ParsedItem[]> {
  return new Promise((resolve, reject) => {
    parse<ParsedItem>(csvData, {
      header: true,
      skipEmptyLines: true,
      complete: (results: ParseResult<ParsedItem>) => {
        if (results.errors.length > 0) {
          const parseErrors = results.errors;
          reject(parseErrors[0]); // Handle parsing errors
        } else {
          const parsedData = results.data;
          resolve(parsedData);
        }
      },
      error: (error: any) => {
        notify.error(error);
        reject(new Error("Failed to parse inventory data"));
      },
    });
  });
}

export async function update(
  inventory: ParsedItem[],
  notify: Notify
) {
  let totalItems = inventory.length;
  let processedItems = 0;
  const categoryIds: string[] = [];
  const manufacturerIds: string[] = [];
  const sizeIds: string[] = [];
  const itemIds: string[] = [];
  let lastCategoryId: string = "";

  for (const row of inventory) {
    let manufacturer: Manufacturer | null = null;
    let size: Size | null = null;
    let product: Product | null = null;
    let image: Image | null = null;

    if (row["Category Id"] === "Category Id") {
      totalItems--;
      continue;
    }

    const categoryId =
      row["Category Id"] === "null" ? null : row["Category Id"];

    if (
      categoryId &&
      categoryId !== lastCategoryId &&
      categoryIds.indexOf(categoryId) === -1
    ) {
      try {
        const updatedCategory = await prismadb.category.upsert({
          where: {
            id: categoryId
          },
          update: {
            name:
              row["Category Name"] === "Website Cart"
                ? "Home"
                : row["Category Name"],
            parentId: row["Parent Group Id"],
            ordinal: parseInt(row["Category Ordinal"].replaceAll(",", "")),
            globalSortOrdinal: parseInt(
              row["Category Global Ordinal"].replaceAll(",", "")
            ),
          },
          create: {
            id: categoryId,
            name:
              row["Category Name"] === "Website Cart"
                ? "Home"
                : row["Category Name"],
            parentId: row["Parent Group Id"],
            ordinal: parseInt(row["Category Ordinal"].replaceAll(",", "")),
            globalSortOrdinal: parseInt(
              row["Category Global Ordinal"].replaceAll(",", "")
            )
          },
        });
        categoryIds.push(updatedCategory.id);
        lastCategoryId = updatedCategory.id;
      } catch (error) {
        notify.error(error);
        console.log("[FLEX_ACTIONS]", error);
        throw new Error(`Category upsert error ${error}`);
      }
    }

    if (row["Item Id"] === "null") {
      processedItems++;
      continue;
    }

    const itemManufacturer =
      row["Manufacturer"] === "null" ? null : row["Manufacturer"];
    if (itemManufacturer) {
      try {
        manufacturer = await prismadb.manufacturer.upsert({
          where: {
            name: itemManufacturer
          },
          update: {
            name: itemManufacturer,
            country:
              row["Manufacturer Country"] === "null"
                ? null
                : row["Manufacturer Country"],
          },
          create: {
            name: itemManufacturer,
            country:
              row["Manufacturer Country"] === "null"
                ? null
                : row["Manufacturer Country"],
          },
        });
      } catch (error) {
        notify.error(error);
        console.log("[FLEX_ACTIONS]", error);
        throw new Error(`Manufacturer upsert error ${error}`);
      }
      manufacturerIds.push(manufacturer.id);
    }

    const itemSize = row["Size"] === "null" ? null : row["Size"];
    if (itemSize && sizeIds) {
      try {
        size = await prismadb.size.upsert({
          where: {
            value: itemSize
          },
          update: {
            value: itemSize,
          },
          create: {
            value: itemSize,
          },
        });
      } catch (error) {
        notify.error(error);
        console.log("[FLEX_ACTIONS]", error);
        throw new Error(`Size upsert error ${error}`);
      }
      sizeIds.push(size.id);
    }

    const itemId = row["Item Id"] === "null" ? null : row["Item Id"];
    if (itemId) {
      try {
        product = await prismadb.product.upsert({
          where: {
            id: row["Item Id"]
          },
          update: {
            name: row["Display String"],
            sizeId: size && size.id,
            description:
              row["Narrative Description"] !== "null"
                ? row["Narrative Description"]
                : "",
            isArchived:
              row["isArchived"].toLowerCase() !== "null"
                ? row["isArchived"].toLowerCase() === "true"
                  ? true
                  : row["isArchived"].toLowerCase() === "false"
                  ? false
                  : false
                : false,
            isFeatured:
              row["isFeatured"].toLowerCase() !== "null"
                ? row["isFeatured"].toLowerCase() === "true"
                  ? true
                  : row["isFeatured"].toLowerCase() === "false"
                  ? false
                  : false
                : false,
            weight: row["Weight"] !== "null" ? row["Weight"] : null,
            dimensions: row["Dimensions"] !== "null" ? row["Dimensions"] : null,
            categoryId: row["Category Id"],
            manufacturerId: manufacturer && manufacturer.id,
            barcode: row["Item Barcode"],
            ordinal: parseInt(row["Item Ordinal"]),
          },
          create: {
            id: row["Item Id"],
            name: row["Display String"],
            sizeId: size && size.id,
            description:
              row["Narrative Description"] !== "null"
                ? row["Narrative Description"]
                : "",
            isArchived:
              row["isArchived"].toLowerCase() !== "null"
                ? row["isArchived"].toLowerCase() === "true"
                  ? true
                  : row["isArchived"].toLowerCase() === "false"
                  ? false
                  : false
                : false,
            isFeatured:
              row["isFeatured"].toLowerCase() !== "null"
                ? row["isFeatured"].toLowerCase() === "true"
                  ? true
                  : row["isFeatured"].toLowerCase() === "false"
                  ? false
                  : false
                : false,
            weight: row["Weight"] !== "null" ? row["Weight"] : null,
            dimensions: row["Dimensions"] !== "null" ? row["Dimensions"] : null,
            categoryId: row["Category Id"],
            manufacturerId: manufacturer && manufacturer.id,
            barcode: row["Item Barcode"],
            ordinal: parseInt(row["Item Ordinal"]),
          },
        });
      } catch (error) {
        notify.error(error);
        console.log("[FLEX_ACTIONS]", error);
        throw new Error(`Product upsert error ${error}`);
      }
      itemIds.push(product.id);

      const itemImage = row["Image URL"] !== "null" ? row["Image URL"] : null;
      if (itemImage) {
        try {
          const imageForProduct = await prismadb.image.findFirst({
            where: {
              productId: product.id,
              url: itemImage,
            },
          });

          if (!imageForProduct?.id) {
            try {
              image = await prismadb.image.create({
                data: {
                  url: itemImage,
                  productId: product.id,
                },
              });
            } catch (error) {
              notify.error(error);
              console.log("[FLEX_ACTIONS]", error);
              throw new Error(`Image create error ${error}`);
            }
          }
        } catch (error) {
          notify.error(error);
          console.log("[FLEX_ACTIONS]", error);
          throw new Error(`Image find error ${error}`);
        }
      }
    }

    processedItems++;
    const progressPercentage = (processedItems / totalItems) * 100;
    notify.json({
      title: "Updating Inventory",
      progress: progressPercentage.toFixed(2),
    });
  }
  notify.log("Cleaning Up");
  try {
    const deletedItems = await prismadb.product.updateMany({
      where: {
        id: { notIn: itemIds },
      },
      data: {
        isArchived: true,
      },
    });
  } catch (error) {
    notify.error(error);
    console.log("[FLEX_ACTIONS]", error);
    throw new Error(`Cleanup products error ${error}`);
  }
  try {
    const deletedCategories = await prismadb.category.deleteMany({
      where: {
        id: { notIn: categoryIds },
      },
    });
  } catch (error) {
    notify.error(error);
    console.log("[FLEX_ACTIONS]", error);
    throw new Error(`Cleanup categories error ${error}`);
  }
  try {
    const deletedManufacuteres = await prismadb.manufacturer.deleteMany({
      where: {
        id: { notIn: manufacturerIds },
      },
    });
  } catch (error) {
    notify.error(error);
    console.log("[FLEX_ACTIONS]", error);
    throw new Error(`Cleanup manufacturers error ${error}`);
  }
  try {
    const deletedSizes = await prismadb.size.deleteMany({
      where: {
        id: { notIn: sizeIds },
      },
    });
  } catch (error) {
    notify.error(error);
    console.log("[FLEX_ACTIONS]", error);
    throw new Error(`Cleanup sizes error ${error}`);
  }
}

type Contact = {
  id: string;
  name: string | null;
  company: string | null;
  jobTitle: string | null;
  email: string | null;
  resourceTypes: string | null;
  organization: boolean;
};

type ContactSearchResult = {
  totalPages: number;
  totalElements: number;
  last: boolean;
  sort: {
    unsorted: boolean;
    sorted: boolean;
    empty: boolean;
  };
  first: boolean;
  pageable: {
    sort: {
      unsorted: boolean;
      sorted: boolean;
      empty: boolean;
    };
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    unpaged: boolean;
    offset: number;
  };
  numberOfElements: number;
  size: number;
  content: Contact[];
  number: number;
  empty: boolean;
};

export async function clientSearch(
  quoteId: string
): Promise<string> {

  const quote = await prismadb.quote.findFirst({
    where: {
      id: quoteId
    },
  });

  if (!quote) {
    throw new Error("Invalid quote Id");
  }

  if (quote.company) {
    const company = await findCompany(quote);
  }

  const searchTerm = `${quote.firstName} ${quote.lastName}`;

  let query = {
    searchText: searchTerm,
    onlyOrganizations: false,
    page: 0,
    size: 100,
  };

  let url = qs.stringifyUrl({
    url: `${process.env.FLEX_URL}/f5/api/contact/search`,
    query,
  });

  let response: ContactSearchResult = await fetch(url, {
    headers: { "X-Auth-Token": `${process.env.FLEX_API_KEY}` },
  }).then((res) => res.json());

  if (response.empty) {
    const client = await createContact(quote);
    return client.id;
  } else {
    if (response.totalElements > 100) {
      query.size = response.totalElements;
      url = qs.stringifyUrl({
        url: `${process.env.FLEX_URL}/f5/api/contact/search`,
        query,
      });
      response = await fetch(url, {
        headers: { "X-Auth-Token": `${process.env.FLEX_API_KEY}` },
      }).then((res) => res.json());
    }

    const contacts = response.content;

    const contact = filterContacts(quote, contacts);

    if (contact) {
      return contact.id;
    } else {
      const client = await createContact(quote);
      return client.id;
    }
  }
}

function filterContacts(
  quote: Quote,
  contacts: Contact[]
): Contact | undefined {
  let exactMatch = contacts.find(
    (contact) =>
      contact.company === quote.company &&
      contact.name === `${quote.firstName} ${quote.lastName}` &&
      contact.email === quote.email
  );

  if (exactMatch) {
    return exactMatch;
  }

  let companyAndNameMatch = contacts.find(
    (contact) =>
      contact.company === quote.company &&
      contact.name === `${quote.firstName} ${quote.lastName}`
  );

  if (companyAndNameMatch) {
    return companyAndNameMatch;
  }

  let nameAndEmailMatch = contacts.find(
    (contact) =>
      contact.name === `${quote.firstName} ${quote.lastName}` &&
      contact.email === quote.email
  );

  if (nameAndEmailMatch) {
    return nameAndEmailMatch;
  }

  let nameMatch = contacts.find(
    (contact) =>
      contact.company === null &&
      contact.name === `${quote.firstName} ${quote.lastName}`
  );

  if (nameMatch) {
    return nameMatch;
  }

  return undefined;
}

async function findCompany(quote: Quote) {
  let query = {
    searchText: quote.company,
    onlyOrganizations: true,
    page: 0,
    size: 100,
  };

  let url = qs.stringifyUrl({
    url: `${process.env.FLEX_URL}/f5/api/contact/search`,
    query,
  });

  const response: ContactSearchResult = await fetch(url, {
    headers: { "X-Auth-Token": `${process.env.FLEX_API_KEY}` },
  }).then((res) => res.json());

  if (response.empty) {
    const company = await createCompany(quote.company!);
    return company;
  } else {
    const results = response.content;

    const company = results.find(
      (company) =>
        company.company === quote.company && company.name === quote.company
    );

    if (!company) {
      const company = await createCompany(quote.company!);
      return company;
    } else {
      return company;
    }
  }
}

async function createCompany(companyName: string) {
  const data = {
    createdByUserId: "ab459c8e-8c9b-40b0-a4f1-3df62095f968",
    organization: true,
    company: companyName,
    defaultBillToContact: true,
    resourceTypes: [
      {
        id: "4ab827cc-abef-11df-b8d5-00e08175e43e",
      },
    ],
  };

  const company = await fetch(`${process.env.FLEX_URL}/f5/api/contact`, {
    method: "POST",
    headers: { "X-Auth-Token": `${process.env.FLEX_API_KEY}` },
    body: JSON.stringify(data),
  }).then((res) => res.json());

  return company;
}

async function createContact(quote: Quote) {
  const data = {
    createdByUserId: "ab459c8e-8c9b-40b0-a4f1-3df62095f968",
    firstName: quote.firstName,
    lastName: quote.lastName,
    organization: false,
    company: quote.company,
    defaultBillToContact: true,
    internetAddresses: [
      {
        name: "Email",
        createdByUserId: "ab459c8e-8c9b-40b0-a4f1-3df62095f968",
        url: quote.email,
        defaultEmail: true,
      },
    ],
    phoneNumbers: [
      {
        name: "Phone",
        createdByUserId: "ab459c8e-8c9b-40b0-a4f1-3df62095f968",
        dialNumber: quote.phone,
        defaultPhone: true,
        defaultFax: false,
      },
    ],
    resourceTypes: [
      {
        id: "4ab827cc-abef-11df-b8d5-00e08175e43e",
      },
    ],
  };

  const client = await fetch(`${process.env.FLEX_URL}/f5/api/contact`, {
    method: "POST",
    headers: { "X-Auth-Token": `${process.env.FLEX_API_KEY}` },
    body: JSON.stringify(data),
  }).then((res) => res.json());

  return client;
}

export async function exportQuote(
  quoteId: string,
  clientId: string
) {
  const quote = await prismadb.quote.findFirst({
    where: {
      id: quoteId,
    },
    include: {
      quoteItems: {
        select: {
          id: true,
          quantity: true,
            product: {
                select: {
                    id: true,
                },
            },
        },
      },
  }});

  if (!quote) {
    throw new Error("Invalid quote Id");
  }
  
  const departmentId =
    quote.deliveryMethod === "DELIVERY"
      ? "e6ca12fc-065a-11e2-8e64-22000afc4ec4"
      : quote.deliveryMethod === "PICKUP"
      ? "e08b60c8-ba18-11e1-8260-22000afc4ec4"
      : "e08b60c8-ba18-11e1-8260-22000afc4ec4";

  const data = {
    definitionId: "9bfb850c-b117-11df-b8d5-00e08175e43e",
    open: false,
    name: `${quote.company} - ${quote.firstName} ${quote.lastName}`,
    statusId: "ddde5e2c-aee7-11df-b8d5-00e08175e43e",
    plannedStartDate: quote.startDate,
    plannedEndDate: quote.endDate,
    personResponsibleId: "58a97bc8-f9e5-4483-b8d9-90e401adb69e",
    assignedToUserId: "ab459c8e-8c9b-40b0-a4f1-3df62095f968",
    referralSourceId: null,
    locationId: "2f49c62c-b139-11df-b8d5-00e08175e43e",
    pickupLocationId: null,
    departmentId: departmentId,
    clientId: clientId,
    billToId: clientId,
    venueId: null,
    projectManagerId: null,
    loadInDate: null,
    loadOutDate: null,
    defaultTime: 1,
    defaultPricingModelId: "af4a35ac-aedf-11df-b8d5-00e08175e43e",
    notes: quote.notes,
    printNotes: true,
    customerPO: null,
    deposit: 0,
    colorCode: "ccffee",
    textColor: "000000",
    shippingMethodId: null,
    returnMethodId: null,
    customField1Value: null,
    customField8Value: null,
    customField9Value: null,
    customFieldValues: {
      "1b6dc30a-3a34-11ed-8074-0a505d6e1818": null,
      "7a6302a0-5b20-48df-b344-bd2a0c632d2c": null,
      "91a0d4b5-2900-4c1d-b201-e1ae4764eacb": null,
      "f891d295-e96a-4062-a129-e1134ebd7d2a": "",
    },
  };

  const flexQuote = await fetch(`${process.env.FLEX_URL}/f5/api/element`, {
    method: "POST",
    headers: { "X-Auth-Token": `${process.env.FLEX_API_KEY}` },
    body: JSON.stringify(data),
  }).then((res) => res.json());

  const contactData = {
    fieldType: "customContactOneId",
    payloadValue: "823a1c9e-9741-11e0-96b4-12314000fae9",
    displayValue: `${quote.deliveryContactName} - ${quote.deliveryContactPhone}`,
    customFieldId: null,
  };

  const pointOfContact = await fetch(
    `${process.env.FLEX_URL}/f5/api/element/${flexQuote.elementId}/header-update`,
    {
      method: "POST",
      headers: { "X-Auth-Token": `${process.env.FLEX_API_KEY}` },
      body: JSON.stringify(contactData),
    }
  );

  // const deliveryAddress = 

  if (quote.deliveryMethod === "DELIVERY") {
    const venue = await fetch(
      `${process.env.FLEX_URL}/f5/api/element/${flexQuote.elementId}/address-data`,
      {
        method: "POST",
        headers: { "X-Auth-Token": `${process.env.FLEX_API_KEY}` },
        body: JSON.stringify(contactData),
      }
    );
  }

  quote.quoteItems.forEach(async (item) => {
    await fetch(`${process.env.FLEX_URL}/f5/api/financial-document-line-item/${flexQuote.elementId}/add-resource/${item.product.id}?managedResourceLineItemType=inventory-model&quantity=${item.quantity}&resourceParentId`,
    {
      method: "POST",
      headers: { "X-Auth-Token": `${process.env.FLEX_API_KEY}` }
    })
  })

}
