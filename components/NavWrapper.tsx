"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

const plainRoutes = ["/about", "/creators", "/filament", "/prints", "/shop", "/dashboard", "/products"];

export default function NavWrapper() {
  const pathname = usePathname();
  const reverseNavItem = plainRoutes.some(route =>
    pathname === route || pathname.startsWith(route + "/")
  );
  return <Navbar reverseNavItem={reverseNavItem} />;
}