"use client";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/purchases-table";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function ComprasPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compras</h1>
          <p className="text-muted-foreground">
            Gestiona tus órdenes de compra
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Compra
        </Button>
      </div>
      <DataTable />
    </div>
  );
}