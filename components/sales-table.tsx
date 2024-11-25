import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const sales = [
  {
    id: "1",
    date: "2024-03-15",
    customer: "Juan Pérez",
    total: "$1,299.99",
    status: "completed",
    paymentMethod: "Tarjeta",
  },
  {
    id: "2",
    date: "2024-03-14",
    customer: "María López",
    total: "$899.99",
    status: "pending",
    paymentMethod: "Efectivo",
  },
  {
    id: "3",
    date: "2024-03-13",
    customer: "Carlos Ruiz",
    total: "$599.99",
    status: "completed",
    paymentMethod: "Transferencia",
  },
];

export function DataTable() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Método de Pago</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell>{sale.date}</TableCell>
              <TableCell>{sale.customer}</TableCell>
              <TableCell>{sale.total}</TableCell>
              <TableCell>
                <Badge
                  variant={sale.status === "completed" ? "success" : "warning"}
                >
                  {sale.status === "completed" ? "Completado" : "Pendiente"}
                </Badge>
              </TableCell>
              <TableCell>{sale.paymentMethod}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}