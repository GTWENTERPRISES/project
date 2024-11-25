"use client";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/suppliers-table";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function ProveedoresPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proveedores</h1>
          <p className="text-muted-foreground">
            Gestiona tus proveedores y contactos
          </p>
        </div>
        
      </div>
      <DataTable />
    </div>
  );
}