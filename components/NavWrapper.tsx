"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

  const plainRoutes = ["/about", "/creators", "/filament", "/prints", "/shop", "/dashboard"];

export default function NavWrapper() {
  const pathname = usePathname();
  const reverseNavItem = plainRoutes.includes(pathname);
  return <Navbar reverseNavItem={reverseNavItem} />;
}