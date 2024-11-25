"use client"; // Add this to make it a client component

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Define types for the API data
interface Venta {
  id: string;
  total: string;
  producto: string;
  fecha: string;
  status: string;
}

interface Compra {
  id: string;
  total: string;
  producto: string;
  fecha: string;
  status: string;
}

export function RecentTransactions() {
  const [transactions, setTransactions] = useState<(Venta | Compra)[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // Fetch Ventas
        const ventasResponse = await fetch('http://localhost:8000/api/ventas/');
        const ventasData: Venta[] = await ventasResponse.json();

        // Fetch Compras
        const comprasResponse = await fetch('http://localhost:8000/api/compras/');
        const comprasData: Compra[] = await comprasResponse.json();

        // Combine and sort transactions
        const combinedTransactions = [
          ...ventasData.map(venta => ({
            ...venta,
            type: 'Venta'
          })),
          ...comprasData.map(compra => ({
            ...compra,
            type: 'Compra'
          }))
        ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

        setTransactions(combinedTransactions);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) {
    return <div>Cargando transacciones...</div>;
  }

  if (error) {
    return <div>Error al cargar las transacciones: {error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transacciones Recientes</CardTitle>
        <CardDescription>
          Últimas transacciones realizadas en el sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <Badge
                    variant={transaction.type === "Venta" ? "default" : "secondary"}
                  >
                    {transaction.type}
                  </Badge>
                </TableCell>
                <TableCell>{transaction.producto}</TableCell>
                <TableCell>${transaction.total}</TableCell>
                <TableCell>{transaction.fecha}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      transaction.status === "completed"
                        ? "success"
                        : "secondary"
                    }
                  >
                    {transaction.status === "completed"
                      ? "Completado"
                      : "Procesando"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}