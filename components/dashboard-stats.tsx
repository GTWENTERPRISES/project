"use client"
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";

// Define types for the API data
interface Venta {
  total: string;
}

interface Producto {
  stock: number;
}

interface Compra {
  total: string;
}

export function DashboardStats() {
  // State to store dashboard statistics
  const [stats, setStats] = useState([
    {
      title: "Ventas Totales",
      value: "$0",
      description: "Último mes",
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      title: "Productos",
      value: "0",
      description: "En inventario",
      icon: Package,
      color: "text-blue-500",
    },
    {
      title: "Compras",
      value: "$0",
      description: "Último mes",
      icon: ShoppingCart,
      color: "text-orange-500",
    },
    {
      title: "Ganancia",
      value: "$0",
      description: "Último mes",
      icon: TrendingUp,
      color: "text-purple-500",
    },
  ]);

  useEffect(() => {
    // Fetch data from APIs
    const fetchDashboardData = async () => {
      try {
        // Fetch Ventas
        const ventasResponse = await fetch('http://localhost:8000/api/ventas/');
        const ventasData: Venta[] = await ventasResponse.json();
        const totalVentas = ventasData.reduce((sum, venta) => sum + parseFloat(venta.total), 0);

        // Fetch Productos
        const productosResponse = await fetch('http://localhost:8000/api/productos/');
        const productosData: Producto[] = await productosResponse.json();
        const totalProductos = productosData.reduce((sum, producto) => sum + producto.stock, 0);

        // Fetch Compras
        const comprasResponse = await fetch('http://localhost:8000/api/compras/');
        const comprasData: Compra[] = await comprasResponse.json();
        const totalCompras = comprasData.reduce((sum, compra) => sum + parseFloat(compra.total), 0);

        // Calculate estimated profit (simplified)
        const estimatedProfit = totalVentas - totalCompras;

        // Update stats
        setStats([
          {
            ...stats[0],
            value: `$${totalVentas.toFixed(2)}`,
          },
          {
            ...stats[1],
            value: totalProductos.toString(),
          },
          {
            ...stats[2],
            value: `$${totalCompras.toFixed(2)}`,
          },
          {
            ...stats[3],
            value: `$${estimatedProfit.toFixed(2)}`,
          },
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []); // Empty dependency array means this runs once on component mount

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}