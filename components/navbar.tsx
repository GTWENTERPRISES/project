"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  BarChart3,
  Package,
  ShoppingCart,
  Store,
  TrendingUp,
} from "lucide-react";

const routes = [
  {
    label: "Panel",
    icon: BarChart3,
    href: "/",
    color: "text-sky-500",
  },
  {
    label: "Inventario",
    icon: Package,
    href: "/inventario",
    color: "text-violet-500",
  },
  {
    label: "Ventas",
    icon: TrendingUp,
    href: "/ventas",
    color: "text-pink-700",
  },
  {
    label: "Compras",
    icon: ShoppingCart,
    href: "/compras",
    color: "text-orange-700",
  },{
    label: "DetallesCompras",
    icon: ShoppingCart,
    href: "/detalles-compras",
    color: "text-orange-700",
  },
  {
    label: "Proveedores",
    icon: Store,
    href: "/proveedores",
    color: "text-emerald-500",
  },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <Package className="h-6 w-6" />
            <span className="font-bold">Inventario EC</span>
          </Link>
          <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === route.href
                    ? "text-black dark:text-white"
                    : "text-muted-foreground"
                )}
              >
                <Button
                  variant={pathname === route.href ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <route.icon className={cn("h-4 w-4 mr-2", route.color)} />
                  {route.label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}