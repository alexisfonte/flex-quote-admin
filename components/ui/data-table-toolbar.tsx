"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "@/components/ui/data-table-view-options";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { FacetedFilter } from "@/components/quote-table";
import { DataTableRowSelectionOptions } from "./data-table-row-selection-options";
import { Quote } from "@prisma/client";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  globalFilter: string;
  facetedFilters?: FacetedFilter[];
}

export function DataTableToolbar<TData extends Quote>({
  table,
  globalFilter,
  facetedFilters,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const isSelected = table.getSelectedRowModel().rows.length > 0;
  console.log(isSelected);

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Search..."
          value={globalFilter ?? ""}
          onChange={(event: { target: { value: string } }) =>
            table.setGlobalFilter(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />

        {facetedFilters && facetedFilters.map(
          (filter) =>
            table.getColumn(filter.id) && (
              <DataTableFacetedFilter
                key={filter.id}
                column={table.getColumn(filter.id)}
                title={filter.id}
                options={filter.options}
              />
            )
        )}

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {table.getColumn("select") && isSelected ? (
        <DataTableRowSelectionOptions table={table} />
      ) : (
        <DataTableViewOptions table={table} />
      )}
    </div>
  );
}