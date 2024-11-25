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
import { Select } from "@/components/ui/select";
import { Edit, Trash, Plus, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Producto {
  id?: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  precio_compra: string;
  precio_venta: string;
  stock: number;
  iva: string;
  categoria: number;
  proveedor: number;
}

interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
}

interface Proveedor {
  id: number;
  tipo_identificacion: string;
  identificacion: string;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
}

const API_BASE_URL = 'http://localhost:8000/api';

export function DataTable() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [productosRes, categoriasRes, proveedoresRes] = await Promise.all([
        fetch(`${API_BASE_URL}/productos/`),
        fetch(`${API_BASE_URL}/categorias/`),
        fetch(`${API_BASE_URL}/proveedores/`)
      ]);

      if (!productosRes.ok || !categoriasRes.ok || !proveedoresRes.ok) {
        throw new Error('Error al cargar los datos');
      }

      const [productosData, categoriasData, proveedoresData] = await Promise.all([
        productosRes.json(),
        categoriasRes.json(),
        proveedoresRes.json()
      ]);

      setProductos(productosData);
      setCategorias(categoriasData);
      setProveedores(proveedoresData);
    } catch (err) {
      setError('Error al cargar los datos. Por favor, intente de nuevo.');
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const formData = new FormData(e.currentTarget);
      const productoData: Producto = {
        codigo: formData.get('codigo') as string,
        nombre: formData.get('nombre') as string,
        descripcion: formData.get('descripcion') as string,
        precio_compra: formData.get('precio_compra') as string,
        precio_venta: formData.get('precio_venta') as string,
        stock: parseInt(formData.get('stock') as string),
        iva: formData.get('iva') as string,
        categoria: parseInt(formData.get('categoria') as string),
        proveedor: parseInt(formData.get('proveedor') as string)
      };

      const url = editingProduct 
        ? `${API_BASE_URL}/productos/${editingProduct.id}/` 
        : `${API_BASE_URL}/productos/`;
        
      const response = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productoData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al guardar el producto');
      }

      await fetchData();
      setEditingProduct(null);
      setIsDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el producto');
      console.error('Error saving product:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este producto?')) {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/productos/${id}/`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Error al eliminar el producto');
        await fetchData();
      } catch (err) {
        setError('Error al eliminar el producto. Por favor, intente de nuevo.');
        console.error('Error deleting product:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
 
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingProduct(null)}>
              <Plus className="mr-2 h-4 w-4" /> Añadir Producto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Editar Producto' : 'Añadir Nuevo Producto'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
  <div className="grid gap-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="codigo">Código</Label>
        <Input
          id="codigo"
          name="codigo"
          defaultValue={editingProduct?.codigo}
          required
          pattern="^[A-Za-z0-9-]+$"  // Only allow alphanumeric characters and hyphens
          title="Código solo debe contener letras, números y guiones"
        />
      </div>
      <div>
        <Label htmlFor="nombre">Nombre</Label>
        <Input
          id="nombre"
          name="nombre"
          defaultValue={editingProduct?.nombre}
          required
          minLength={3}  // Ensure the name is at least 3 characters long
          title="El nombre debe tener al menos 3 caracteres"
        />
      </div>
    </div>
    <div>
      <Label htmlFor="descripcion">Descripción</Label>
      <Textarea
        id="descripcion"
        name="descripcion"
        defaultValue={editingProduct?.descripcion}
        rows={3}
      />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="precio_compra">Precio de Compra</Label>
        <Input
          id="precio_compra"
          name="precio_compra"
          type="number"
          step="0.01"
          defaultValue={editingProduct?.precio_compra}
          required
          min="0.01"  // Price must be greater than 0
          title="El precio de compra debe ser mayor que 0"
        />
      </div>
      <div>
        <Label htmlFor="precio_venta">Precio de Venta</Label>
        <Input
          id="precio_venta"
          name="precio_venta"
          type="number"
          step="0.01"
          defaultValue={editingProduct?.precio_venta}
          required
          min="0.01"  // Price must be greater than 0
          title="El precio de venta debe ser mayor que 0"
        />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="stock">Stock</Label>
        <Input
          id="stock"
          name="stock"
          type="number"
          defaultValue={editingProduct?.stock}
          required
          min="1"  // Stock must be at least 1
          title="El stock debe ser al menos 1"
        />
      </div>
      <div>
        <Label htmlFor="iva">IVA</Label>
        <Input
          id="iva"
          name="iva"
          type="number"
          step="0.01"
          defaultValue={editingProduct?.iva || "12.00"}
          required
          disabled
          min="0"
          max="100"  // Limit the range of IVA between 0% and 100%
          title="El IVA debe ser entre 0 y 100"
        />
      </div>
    </div>
    <div>
      <Label htmlFor="categoria">Categoría</Label>
      <select
        id="categoria"
        name="categoria"
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        defaultValue={editingProduct?.categoria || ""}
        required
        title="Seleccione una categoría"
      >
        <option value="">Seleccione una categoría</option>
        {categorias.map((categoria) => (
          <option key={categoria.id} value={categoria.id}>
            {categoria.nombre}
          </option>
        ))}
      </select>
    </div>
    <div>
      <Label htmlFor="proveedor">Proveedor</Label>
      <select
        id="proveedor"
        name="proveedor"
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        defaultValue={editingProduct?.proveedor || ""}
        required
        title="Seleccione un proveedor"
      >
        <option value="">Seleccione un proveedor</option>
        {proveedores.map((proveedor) => (
          <option key={proveedor.id} value={proveedor.id}>
            {proveedor.identificacion} - {proveedor.nombre}
          </option>
        ))}
      </select>
    </div>
  </div>
  <div className="flex justify-end gap-4">
    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
      Cancelar
    </Button>
    <Button type="submit">
      {editingProduct ? 'Guardar' : 'Añadir'}
    </Button>
  </div>
</form>

          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <Button className="ml-2" onClick={fetchData}>Reintentar</Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Precio Compra</TableHead>
              <TableHead>Precio Venta</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productos.map((producto) => (
              <TableRow key={producto.id}>
                <TableCell>{producto.codigo}</TableCell>
                <TableCell>{producto.nombre}</TableCell>
                <TableCell>${producto.precio_compra}</TableCell>
                <TableCell>${producto.precio_venta}</TableCell>
                <TableCell>{producto.stock}</TableCell>
                <TableCell>
                  {categorias.find(c => c.id === producto.categoria)?.nombre}
                </TableCell>
                <TableCell>
                  {proveedores.find(p => p.id === producto.proveedor)?.nombre}
                </TableCell>
                <TableCell>
                  {producto.stock > 10 ? (
                    <Badge variant="success">En Stock</Badge>
                  ) : producto.stock > 0 ? (
                    <Badge variant="warning">Bajo Stock</Badge>
                  ) : (
                    <Badge variant="destructive">Sin Stock</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingProduct(producto);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(producto.id!)}
                    >
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Eliminar</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

