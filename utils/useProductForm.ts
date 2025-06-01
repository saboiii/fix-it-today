import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export function useProductForm(product?: Product) {
  const { user } = useUser();
  const [form, setForm] = useState({
    name: "",
    description: "",
    stock: 0,
    priceCredits: 0,
    price: 0,
    creatorUserId: "",
    creatorFullName: "",
  });

  useEffect(() => {
    if (user && !product) {
      setForm((prev) => ({
        ...prev,
        creatorUserId: user.id,
        creatorFullName:
          user.fullName ||
          `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      }));
    }
  }, [user]);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || "",
        description: product.description || "",
        stock: product.stock || 0,
        priceCredits: product.priceCredits || 0,
        price: product.price || 0,
        creatorUserId: product.creatorUserId || "",
        creatorFullName: product.creatorFullName || "",
      });
    }
  }, [product]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,     
    }));
  };

  return { form, setForm, handleChange };
}
