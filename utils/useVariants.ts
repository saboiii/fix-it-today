import { useState } from "react";

export function useVariants(initialVariants: string[] = []) {
  const [variants, setVariants] = useState<string[]>(initialVariants);
  const [variantInput, setVariantInput] = useState<string>("");

  const handleAddVariant = () => {
    if (variantInput.trim()) {
      setVariants((prev) => [...prev, variantInput.trim()]);
      setVariantInput("");
    }
  };

  const handleRemoveVariant = (idx: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  };

  return { variants, setVariants, variantInput, setVariantInput, handleAddVariant, handleRemoveVariant };
}