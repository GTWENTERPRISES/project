import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  precio: string;
}

interface DetalleCompra {
  id: number;
  cantidad: number;
  precio_unitario: string;
  subtotal: string;
  iva: string;
  total: string;
  producto: Producto;
  compra: number;
}

interface Compra {
  id: number;
  codigo: string;
  fecha: string;
  numero_factura: string;
  subtotal: string;
  iva: string;
  total: string;
  forma_pago: string;
  estado: string;
}

export function DetallesCompraCarrito() {
  const [detalles, setDetalles] = useState<DetalleCompra[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [selectedCompra, setSelectedCompra] = useState<Compra | null>(null);
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    fetchProductos();
    fetchCompras();
    fetchDetallesCompra();
  }, []);

  const fetchProductos = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/productos/');
      if (!response.ok) throw new Error('Error al cargar productos');
      const data = await response.json();
      setProductos(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompras = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/compras/');
      if (!response.ok) throw new Error('Error al cargar compras');
      const data = await response.json();
      setCompras(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las compras",
        variant: "destructive",
      });
    }
  };

  const fetchDetallesCompra = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/detalles-compra/');
      if (!response.ok) throw new Error('Error al cargar detalles de compra');
      const data = await response.json();
      setDetalles(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles de compra",
        variant: "destructive",
      });
    }
  };

  const filteredProductos = productos.filter((producto) =>
    producto.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectProducto = (producto: Producto) => {
    setSelectedProducto(producto);
    setShowProductDialog(false);
  };

  
  
  const handleAgregarDetalle = () => {
    if (!selectedProducto || !selectedCompra) {
      toast({
        title: "Error",
        description: "Debe seleccionar un producto y una compra",
        variant: "destructive",
      });
      return;
    }
  
    // Parsear el precio del producto a número
    const precioProducto = parseFloat(selectedProducto.precio);
    
    // Calcular subtotal
    const subtotal = (cantidad * precioProducto).toFixed(2);
    
    // Calcular IVA (asumiendo un IVA del 12%)
    const iva = (parseFloat(subtotal) * 0.12).toFixed(2);
    
    // Calcular total
    const total = (parseFloat(subtotal) + parseFloat(iva)).toFixed(2);
  
    const nuevoDetalle: DetalleCompra = {
      id: Date.now(),
      cantidad,
      precio_unitario: precioProducto.toFixed(2),
      subtotal,
      iva,
      total,
      producto: selectedProducto,
      compra: selectedCompra.id,
    };
  
    // Verificar si el producto ya existe en los detalles
    const productoExistente = detalles.find(
      d => d.producto.id === selectedProducto.id
    );
  
    if (productoExistente) {
      // Si existe, actualizar la cantidad y recalcular valores
      setDetalles(prev => prev.map(detalle => 
        detalle.producto.id === selectedProducto.id
          ? {
              ...detalle, 
              cantidad: detalle.cantidad + cantidad,
              subtotal: (
                (detalle.cantidad + cantidad) * 
                parseFloat(detalle.precio_unitario)
              ).toFixed(2),
              iva: (
                ((detalle.cantidad + cantidad) * 
                parseFloat(detalle.precio_unitario) * 0.12)
              ).toFixed(2),
              total: (
                ((detalle.cantidad + cantidad) * 
                parseFloat(detalle.precio_unitario) * 1.12)
              ).toFixed(2),
            }
          : detalle
      ));
    } else {
      // Si no existe, agregar nuevo detalle
      setDetalles(prev => [...prev, nuevoDetalle]);
    }
  
    // Resetear estados
    toast({
      title: "Producto Agregado",
      description: `${selectedProducto.nombre} - Cantidad: ${cantidad} - Total: $${total}`,
    });
  
    setSelectedProducto(null);
    setCantidad(1);
  };
  const handleDeleteDetalle = (id: number) => {
    // Filtrar los detalles para eliminar el detalle con el ID especificado
    const nuevosDetalles = detalles.filter(detalle => detalle.id !== id);
    
    // Actualizar el estado de detalles
    setDetalles(nuevosDetalles);
  
    // Mostrar una notificación de que el producto fue eliminado
    toast({
      title: "Producto Eliminado",
      description: "El producto ha sido removido de la lista de detalles",
    });
  };
  const handleGuardarDetalles = async () => {
    if (detalles.length === 0 || !selectedCompra) {
      toast({
        title: "Error",
        description: detalles.length === 0 
          ? "No hay detalles de compra para guardar" 
          : "Debe seleccionar una compra primero",
        variant: "destructive",
      });
      return;
    }
  
    try {
      // Calcular totales generales de la compra
      const subtotalCompra = detalles.reduce(
        (total, detalle) => total + parseFloat(detalle.subtotal), 
        0
      );
      const ivaCompra = detalles.reduce(
        (total, detalle) => total + parseFloat(detalle.iva), 
        0
      );
      const totalCompra = detalles.reduce(
        (total, detalle) => total + parseFloat(detalle.total), 
        0
      );
  
      for (const detalle of detalles) {
        const detalleCompra = {
          cantidad: detalle.cantidad,
          precio_unitario: detalle.precio_unitario,
          subtotal: detalle.subtotal,
          iva: detalle.iva,
          total: detalle.total,
          producto: detalle.producto.id,
          compra: selectedCompra.id,
        };
  
        const response = await fetch('http://localhost:8000/api/detalles-compra/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(detalleCompra),
        });
  
        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Error al guardar: ${errorBody}`);
        }
      }
  
      // Opcional: Actualizar el total de la compra en el backend
      await fetch(`http://localhost:8000/api/compras/${selectedCompra.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subtotal: subtotalCompra.toFixed(2),
          iva: ivaCompra.toFixed(2),
          total: totalCompra.toFixed(2),
        }),
      });
  
      toast({
        title: "Detalles guardados",
        description: `Compra guardada. Total: $${totalCompra.toFixed(2)}`,
      });
  
      setDetalles([]);
      setSelectedCompra(null);
    } catch (error) {
      console.error('Error:', error);
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudieron guardar los detalles de compra",
        variant: "destructive",
      });
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalles de Compra</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Selector de Compra */}
        <div className="mb-4">
          <Select 
            value={selectedCompra ? selectedCompra.id.toString() : undefined}
            onValueChange={(value) => {
              const compra = compras.find(c => c.id === parseInt(value));
              setSelectedCompra(compra || null);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar Compra" />
            </SelectTrigger>
            <SelectContent>
              {compras.map((compra) => (
                <SelectItem 
                  key={compra.id} 
                  value={compra.id.toString()}
                >
                  {`Compra ${compra.codigo} - ${compra.fecha}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sección para agregar producto */}
        <div className="flex space-x-4 mb-4">
          <Button 
            onClick={() => setShowProductDialog(true)}
            disabled={!selectedCompra}
          >
            Agregar Producto
          </Button>
          
          {selectedProducto && (
            <div className="flex items-center space-x-2">
              <Input 
                type="number" 
                min="1" 
                value={cantidad} 
                onChange={(e) => setCantidad(parseInt(e.target.value))}
                className="w-20"
              />
              <Button 
                onClick={handleAgregarDetalle}
                disabled={!selectedProducto || cantidad < 1}
              >
                Confirmar
              </Button>
            </div>
          )}
        </div>

        {/* Tabla de detalles de compra */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Precio Unitario</TableHead>
              <TableHead>Subtotal</TableHead>
              <TableHead>IVA</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {detalles.map((detalle) => (
              <TableRow key={detalle.id}>
                <TableCell>{detalle.producto.codigo}</TableCell>
                <TableCell>{detalle.producto.nombre}</TableCell>
                <TableCell>{detalle.cantidad}</TableCell>
                <TableCell>{detalle.precio_unitario}</TableCell>
                <TableCell>{detalle.subtotal}</TableCell>
                <TableCell>{detalle.iva}</TableCell>
                <TableCell>{detalle.total}</TableCell>
                <TableCell>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleDeleteDetalle(detalle.id)}
                  >
                    <Trash2 />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
            
        {/* Botón para guardar detalles */}
        <div className="mt-4">
          <Button onClick={handleGuardarDetalles} disabled={detalles.length === 0}>
            Guardar Detalles
          </Button>
        </div>

        {/* Diálogo para seleccionar producto */}
        <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Seleccionar Producto</DialogTitle>
            </DialogHeader>
            <Input 
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="mt-4">
              {filteredProductos.map((producto) => (
                <Button 
                  key={producto.id} 
                  onClick={() => handleSelectProducto(producto)}
                >
                  {producto.nombre}
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}