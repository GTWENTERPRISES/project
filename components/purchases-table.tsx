import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";

interface Proveedor {
  id: string;
  tipo_identificacion: 'RUC' | 'CED';
  identificacion: string;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
}
interface DetalleCompra {
  id: number;
  producto: {
    id: number;
    nombre: string;
    codigo: string;
  };
  cantidad: number;
  precio_unitario: string;
  subtotal: string;
  iva: string;
  total: string;
}
interface Proveedor {
  id: string;
  nombre: string;
}

interface Purchase {
  id: number;
  fecha: string;
  numero_factura: string;
  proveedor: string; 
  subtotal: string;
  iva: string;
  total: string;
  estado: 'PENDIENTE' | 'COMPLETADA' | 'ANULADA';
}

interface PurchaseForm {
  numero_factura: string;
  subtotal: string;
  iva: string;
  total: string;
  estado: 'PENDIENTE' | 'COMPLETADA' | 'ANULADA';
  proveedor: string;
}

export function DataTable() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [proveedores, setProveedores] = useState<{ id: string, nombre: string }[]>([]);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<number | null>(null);

  const createForm = useForm<PurchaseForm>({
    defaultValues: {
      numero_factura: '',
      subtotal: '0.00',
      iva: '12.00',
      total: '0.00',
      estado: 'PENDIENTE',
      proveedor: '',
    }
  });
  const PurchaseDetails = ({ purchaseId }: { purchaseId: number }) => {
    const [details, setDetails] = useState<DetalleCompra[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedDetails, setEditedDetails] = useState<DetalleCompra[]>([]);
  
    useEffect(() => {
      const fetchDetails = async () => {
        try {
          setIsLoading(true);
          setError(null);
  
          const response = await fetch(`http://localhost:8000/api/compras/${purchaseId}/detalles/`);
  
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
  
          const data = await response.json();
          setDetails(data);
        } catch (error) {
          console.error('Error fetching details:', error);
          setError('No se pudieron cargar los detalles de la compra. Por favor, intente nuevamente.');
        } finally {
          setIsLoading(false);
        }
      };
  
      if (purchaseId) {
        fetchDetails();
      }
    }, [purchaseId]);
  
    const handleEdit = () => {
      setIsEditing(true);
      setEditedDetails([...details]);
    };
  
    const handleSave = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/compras/${purchaseId}/detalles/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(editedDetails),
        });
  
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server response:', errorText);
          throw new Error('Error al guardar los detalles de la compra');
        }
  
        setIsEditing(false);
        setDetails(editedDetails);
      } catch (error) {
        console.error('Error saving details:', error);
      }
    };
  
    if (isLoading) {
      return (
        <div className="flex justify-center items-center p-8">
          <p className="text-lg text-gray-600">Cargando detalles...</p>
        </div>
      );
    }
  
    if (error) {
      return (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }
  
    if (!details || details.length === 0) {
      return (
        <Alert>
          <AlertTitle>Sin detalles</AlertTitle>
          <AlertDescription>No hay detalles disponibles para esta compra.</AlertDescription>
        </Alert>
      );
    }
  
  
  
    return (
      <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead className="text-right">Precio Unit.</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
              <TableHead className="text-right">IVA</TableHead>
              <TableHead className="text-right">Total</TableHead>
              {isEditing && (
                <TableHead className="text-center">Acciones</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {editedDetails.map((detail, index) => (
              <TableRow key={detail.id}>
                <TableCell>{detail.producto.nombre}</TableCell>
                <TableCell className="text-right">
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editedDetails[index].cantidad}
                      onChange={(e) => {
                        const newDetails = [...editedDetails];
                        newDetails[index].cantidad = parseInt(e.target.value);
                        setEditedDetails(newDetails);
                      }}
                    />
                  ) : (
                    detail.cantidad
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editedDetails[index].precio_unitario}
                      onChange={(e) => {
                        const newDetails = [...editedDetails];
                        newDetails[index].precio_unitario = e.target.value;
                        setEditedDetails(newDetails);
                      }}
                    />
                  ) : (
                    detail.precio_unitario
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editedDetails[index].subtotal}
                      onChange={(e) => {
                        const newDetails = [...editedDetails];
                        newDetails[index].subtotal = e.target.value;
                        setEditedDetails(newDetails);
                      }}
                    />
                  ) : (
                    detail.subtotal
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editedDetails[index].iva}
                      onChange={(e) => {
                        const newDetails = [...editedDetails];
                        newDetails[index].iva = e.target.value;
                        setEditedDetails(newDetails);
                      }}
                    />
                  ) : (
                    detail.iva
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editedDetails[index].total}
                      onChange={(e) => {
                        const newDetails = [...editedDetails];
                        newDetails[index].total = e.target.value;
                        setEditedDetails(newDetails);
                      }}
                    />
                  ) : (
                    detail.total
                  )}
                </TableCell>
                {isEditing && (
                  <TableCell className="text-center">
                    <Button variant="secondary" onClick={handleSave}>
                      Guardar
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!isEditing && (
          <Button variant="secondary" onClick={handleEdit}>
            Editar
          </Button>
        )}
      </CardContent>
    </Card>
    );
  };
  const editForm = useForm<PurchaseForm>({
    defaultValues: {
      numero_factura: '',
      subtotal: '0.00',
      iva: '12.00',
      total: '0.00',
      estado: 'PENDIENTE',
      proveedor: '',
    }
  });

  useEffect(() => {
    fetchPurchases();
    fetchProveedores();
  }, []);

  useEffect(() => {
    if (selectedPurchase) {
      editForm.reset({
        numero_factura: selectedPurchase.numero_factura,
        subtotal: selectedPurchase.subtotal,
        iva: selectedPurchase.iva,
        total: selectedPurchase.total,
        estado: selectedPurchase.estado,
        proveedor: selectedPurchase.proveedor,
      });
    }
  }, [selectedPurchase, editForm]);

  const fetchPurchases = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/compras/', {
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Error al obtener compras');
      const data = await response.json();
      setPurchases(data);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las compras",
        variant: "destructive",
      });
    }
  };

  const fetchProveedores = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/proveedores/', {
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Error al obtener proveedores');
      const data = await response.json();
      setProveedores(data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los proveedores",
        variant: "destructive",
      });
    }
  };

  const calculateTotals = (subtotal: string, form: any) => {
    const subtotalNumber = parseFloat(subtotal) || 0;
    const ivaNumber = subtotalNumber * 0.12;
    const totalNumber = subtotalNumber + ivaNumber;

    form.setValue('iva', ivaNumber.toFixed(2));
    form.setValue('total', totalNumber.toFixed(2));
  };

  const createPurchase = async (formData: PurchaseForm) => {
    try {
      setIsSubmitting(true);
      
      const purchaseData = {
        numero_factura: formData.numero_factura,
        subtotal: formData.subtotal,
        iva: formData.iva,
        total: formData.total,
        estado: formData.estado,
        proveedor: formData.proveedor,
      };

      const response = await fetch('http://localhost:8000/api/compras/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(purchaseData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error('Error al crear la compra');
      }

      await fetchPurchases();
      createForm.reset();
      setShowCreateDialog(false);
      toast({
        title: "Éxito",
        description: "Compra creada correctamente",
      });
    } catch (error) {
      console.error('Error creating purchase:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la compra",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updatePurchase = async (formData: PurchaseForm) => {
    if (!selectedPurchase) return;

    try {
      setIsSubmitting(true);
      
      const purchaseData = {
        numero_factura: formData.numero_factura,
        subtotal: formData.subtotal,
        iva: formData.iva,
        total: formData.total,
        estado: formData.estado,
        proveedor: formData.proveedor,
      };

      const response = await fetch(`http://localhost:8000/api/compras/${selectedPurchase.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(purchaseData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error('Error al actualizar la compra');
      }

      await fetchPurchases();
      editForm.reset();
      setShowEditDialog(false);
      setSelectedPurchase(null);
      toast({
        title: "Éxito",
        description: "Compra actualizada correctamente",
      });
    } catch (error) {
      console.error('Error updating purchase:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la compra",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setShowEditDialog(true);
  };

  const getStatusBadgeVariant = (status: Purchase['estado']) => {
    switch (status) {
      case 'COMPLETADA':
        return 'success';
      case 'PENDIENTE':
        return 'warning';
      case 'ANULADA':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: Purchase['estado']) => {
    switch (status) {
      case 'COMPLETADA':
        return 'Completada';
      case 'PENDIENTE':
        return 'Pendiente';
      case 'ANULADA':
        return 'Anulada';
      default:
        return status;
    }
  };

  const PurchaseForm = ({ form, onSubmit, isEdit = false }: { form: any, onSubmit: (data: PurchaseForm) => void, isEdit?: boolean }) => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="numero_factura"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de Factura</FormLabel>
              <FormControl>
                <Input placeholder="Ingrese el número de factura" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subtotal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subtotal</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00" 
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    calculateTotals(e.target.value, form);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="iva"
          render={({ field }) => (
            <FormItem>
              <FormLabel>IVA (12%)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  readOnly 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="total"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  readOnly 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="estado"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <FormControl>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                    <SelectItem value="COMPLETADA">Completada</SelectItem>
                    <SelectItem value="ANULADA">Anulada</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="proveedor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proveedor</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {proveedores.map((proveedor) => (
                      <SelectItem key={proveedor.id} value={proveedor.id}>
                        {proveedor.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full"
        >
          {isSubmitting ? 'Cargando...' : isEdit ? 'Actualizar Compra' : 'Crear Compra'}
        </Button>
      </form>
    </Form>
  );

  return (
    <div className="space-y-4">
    <div className="flex justify-end">
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>Nueva Compra</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Compra</DialogTitle>
            </DialogHeader>
            <PurchaseForm form={createForm} onSubmit={createPurchase} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Mantener el diálogo de edición existente */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Compra</DialogTitle>
          </DialogHeader>
          <PurchaseForm form={editForm} onSubmit={updatePurchase} isEdit />
        </DialogContent>
      </Dialog>

      {/* Añadir el nuevo diálogo de detalles */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
  <DialogContent className="max-w-4xl">
    <DialogHeader>
      <DialogTitle>Detalles de la Compra</DialogTitle>
    </DialogHeader>
    {selectedPurchaseId && (
      <PurchaseDetails 
        purchaseId={selectedPurchaseId} 
        onClose={() => setShowDetailsDialog(false)} 
      />
    )}
  </DialogContent>
</Dialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left">Fecha</TableHead>
            <TableHead className="text-left">N° Factura</TableHead>
            <TableHead className="text-left">Proveedor</TableHead>
            <TableHead className="text-right">Subtotal</TableHead>
            <TableHead className="text-right">IVA</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-center">Estado</TableHead>
            <TableHead className="text-center">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchases.map((purchase) => (
            <TableRow key={purchase.id}>
              <TableCell className="text-left">
                {new Date(purchase.fecha).toLocaleDateString('es-EC', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </TableCell>
              <TableCell className="text-left">{purchase.numero_factura}</TableCell>
              <TableCell className="text-left">{purchase.proveedor}</TableCell>
              <TableCell className="text-right">
                ${parseFloat(purchase.subtotal).toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                ${parseFloat(purchase.iva).toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                ${parseFloat(purchase.total).toFixed(2)}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant={getStatusBadgeVariant(purchase.estado)}>
                  {getStatusText(purchase.estado)}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => handleEdit(purchase)}
                    className="w-20"
                  >
                    Ver
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSelectedPurchaseId(purchase.id);
                      setShowDetailsDialog(true);
                    }}
                    className="w-20"
                  >
                    Detalles
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
