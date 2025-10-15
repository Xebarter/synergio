'use client';

import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { Customer } from "./columns";

interface CustomersTableProps {
  customers: Customer[];
}

export function CustomersTable({ customers }: CustomersTableProps) {
  try {
    return (
      <div className="space-y-4">
        <DataTable 
          columns={columns} 
          data={customers} 
          searchKey="name"
          filterOptions={[
            {
              label: "Orders",
              value: "totalOrders",
              options: [
                { label: "No Orders", value: "0" },
                { label: "1-5 Orders", value: "1-5" },
                { label: "5+ Orders", value: "5+" },
              ]
            }
          ]}
        />
      </div>
    );
  } catch (error) {
    console.error("Error rendering CustomersTable:", error);
    return <div className="text-red-500">Failed to load customer data. Please try again later.</div>;
  }
}