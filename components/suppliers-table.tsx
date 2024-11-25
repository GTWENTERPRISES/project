'use client'

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Trash, Plus, Loader2, Search, RefreshCcw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Proveedor {
  id?: number;
  tipo_identificacion: string;
  identificacion: string;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
}

const TIPOS_IDENTIFICACION = {
  RUC: "Registro Único de Contribuyentes",
  CED: "Cédula de Identidad"
};

const API_BASE_URL = 'http://localhost:8000/api';

export function DataTable() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [editingSupplier, setEditingSupplier] = useState<Proveedor | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoIdentificacion, setTipoIdentificacion] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (editingSupplier) {
      setTipoIdentificacion(editingSupplier.tipo_identificacion || "");
    } else {
      setTipoIdentificacion("");
    }
  }, [editingSupplier]);

  const fetchSuppliers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/proveedores/`);
      if (!response.ok) throw new Error('Error al cargar los proveedores');
      const data = await response.json();
      setProveedores(data);
    } catch (err) {
      setError('Error al cargar los proveedores. Por favor, intente de nuevo.');
      console.error('Error fetching suppliers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const supplierData: Proveedor = {
        tipo_identificacion: tipoIdentificacion,
        identificacion: formData.get('identificacion') as string,
        nombre: formData.get('nombre') as string,
        direccion: formData.get('direccion') as string,
        telefono: formData.get('telefono') as string,
        email: formData.get('email') as string,
      };

      const url = editingSupplier
        ? `${API_BASE_URL}/proveedores/${editingSupplier.id}/`
        : `${API_BASE_URL}/proveedores/`;

      const response = await fetch(url, {
        method: editingSupplier ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(supplierData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al guardar el proveedor');
      }

      await fetchSuppliers();
      setEditingSupplier(null);
      setIsDialogOpen(false);
      showSuccessMessage(editingSupplier ? 'Proveedor actualizado exitosamente' : 'Proveedor creado exitosamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el proveedor');
      console.error('Error saving supplier:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este proveedor?')) {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/proveedores/${id}/`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Error al eliminar el proveedor');
        await fetchSuppliers();
        showSuccessMessage('Proveedor eliminado exitosamente');
      } catch (err) {
        setError('Error al eliminar el proveedor. Por favor, intente de nuevo.');
        console.error('Error deleting supplier:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const filteredProveedores = proveedores.filter(proveedor =>
    proveedor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proveedor.identificacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proveedor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Header y Controles */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar proveedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full sm:w-[300px]"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingSupplier(null)}>
                <Plus className="mr-2 h-4 w-4" /> Añadir Proveedor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingSupplier ? 'Editar Proveedor' : 'Añadir Nuevo Proveedor'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="tipo_identificacion">Tipo de Identificación</Label>
                    <select
                      id="tipo_identificacion"
                      name="tipo_identificacion"
                      value={tipoIdentificacion}
                      onChange={(e) => setTipoIdentificacion(e.target.value)}
                      required
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Seleccione un tipo</option>
                      {Object.entries(TIPOS_IDENTIFICACION).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="identificacion">Identificación</Label>
                    <Input
                      id="identificacion"
                      name="identificacion"
                      defaultValue={editingSupplier?.identificacion}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                      id="nombre"
                      name="nombre"
                      defaultValue={editingSupplier?.nombre}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="direccion">Dirección</Label>
                    <Textarea
                      id="direccion"
                      name="direccion"
                      defaultValue={editingSupplier?.direccion}
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      name="telefono"
                      defaultValue={editingSupplier?.telefono}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={editingSupplier?.email}
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingSupplier ? 'Guardar' : 'Añadir'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Mensajes de Error y Éxito */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button size="sm" onClick={fetchSuppliers}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <AlertTitle>¡Éxito!</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Tabla de Proveedores */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Identificación</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProveedores.length > 0 ? (
              filteredProveedores.map((proveedor) => (
                <TableRow key={proveedor.id}>
                  <TableCell className="font-medium">{proveedor.nombre}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {TIPOS_IDENTIFICACION[proveedor.tipo_identificacion as keyof typeof TIPOS_IDENTIFICACION]}: {proveedor.identificacion}
                    </Badge>
                  </TableCell>
                  <TableCell>{proveedor.telefono}</TableCell>
                  <TableCell>{proveedor.email}</TableCell>
                  <TableCell>{proveedor.direccion}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingSupplier(proveedor);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(proveedor.id!)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No se encontraron proveedores
                  {searchTerm && " que coincidan con la búsqueda"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}