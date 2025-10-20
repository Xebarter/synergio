"use client"

import * as React from "react"
import { Table } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X, Plus, SlidersHorizontal } from "lucide-react"
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter"
import { DataTableViewOptions } from "@/components/ui/data-table-column-toggle"

export interface FilterOption {
  label: string
  value: string
  options: { label: string; value: string }[]
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchKey?: string
  filterOptions?: FilterOption[]
}

export function DataTableToolbar<TData>({
  table,
  searchKey,
  filterOptions = [],
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {searchKey && (
          <div className="relative">
            <Input
              placeholder="Search..."
              value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn(searchKey)?.setFilterValue(event.target.value)
              }
              className="h-8 w-[150px] lg:w-[250px]"
            />
            {table.getColumn(searchKey)?.getFilterValue() && 
             typeof table.getColumn(searchKey)?.getFilterValue() === 'string' &&
             (table.getColumn(searchKey)?.getFilterValue() as string).length > 0 ? (
              <Button
                variant="ghost"
                onClick={() => table.getColumn(searchKey)?.setFilterValue("")}
                className="h-8 w-8 p-0 absolute right-0 top-0"
              >
                <X className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        )}
        
        {filterOptions.map((option) => (
          <DataTableFacetedFilter
            key={option.value}
            column={table.getColumn(option.value)}
            title={option.label}
            options={option.options}
          />
        ))}
        
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8"
          onClick={() => {
            // Handle new item action
            console.log("New item clicked")
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          New
        </Button>
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}
