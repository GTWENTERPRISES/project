"use client";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ProductDialog } from "@/components/product-dialog";

export default function InventoryPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventario</h1>
          <p className="text-muted-foreground">
            Gestiona tus productos y existencias
          </p>
        </div>
        
      </div>
      <DataTable />
      <ProductDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}