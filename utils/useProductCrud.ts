import { generateSlug } from "@/utils/productHelpers";

interface UseProductCrudHookProps {
  productForEditContext?: Product;
  onClose: () => void;
  onProductCreated?: () => void;
  onProductUpdated?: () => void;
  setMainLoading: (loading: boolean) => void;
  setDeleting: (deleting: boolean) => void;
}

export function useProductCrud({
  productForEditContext,
  onClose,
  onProductCreated,
  onProductUpdated,
  setMainLoading,
  setDeleting,
}: UseProductCrudHookProps) {
  const getEmptyFields = (data: ProductDataForApi) => {
    const missing: string[] = [];
    if (!data.name?.trim()) missing.push("Product Name");
    if (!data.description?.trim()) missing.push("Description");
    if (!data.category) missing.push("Category");
    if (data.price === undefined || data.price === null || data.price < 0)
      missing.push("Price (SGD)");
    if (
      data.priceCredits === undefined ||
      data.priceCredits === null ||
      data.priceCredits < 0
    )
      missing.push("Price (Credits)");
    if (data.stock === undefined || data.stock === null || data.stock < 0)
      missing.push("Stock");


    if (!data.deliveryTypes || data.deliveryTypes.length === 0) {
      missing.push("Delivery Options");
    } else {
      const singpostEntry = data.deliveryTypes.find((dt) => dt.type === "singpost");
      if (singpostEntry) {
        
        const singpostPrice = singpostEntry.price; // Type: number | { fee: number; royalty: number }
        let isSingpostPriceInvalid = false;

        // Check if singpostPrice is the expected object structure
        if (typeof singpostPrice === "object" && singpostPrice !== null) {
          // At this point, TypeScript knows singpostPrice is { fee: number; royalty: number }
          // because it's the only object shape in the union.
          // Let's assign it to a new const for clarity, though direct access should also work.
          const priceObject = singpostPrice as { fee: number; royalty: number };

          if (
            // Runtime checks for data integrity, even if types imply correctness.
            typeof priceObject.fee !== 'number' ||
            typeof priceObject.royalty !== 'number' ||
            priceObject.fee < 0 ||
            priceObject.royalty < 0
          ) {
            isSingpostPriceInvalid = true;
          }
        } else {
          // singpostPrice is not the expected object (e.g., it's a number, or null/undefined if types were looser)
          isSingpostPriceInvalid = true;
        }

        if (isSingpostPriceInvalid) {
          missing.push(
            "Valid SingPost Fee and Royalty (must be an object like {fee: number, royalty: number} with non-negative, numeric values)"
          );
        }
      }
      if (
        data.deliveryTypes.some(
          (dt) => dt.type === "private" && (typeof dt.price !== "number" || dt.price < 0)
        )
      ) {
        missing.push("Private Shipping Fee (must be 0 or greater if private shipping is selected)");
      }
      if (
        data.deliveryTypes.some((dt) => dt.type === "self-collect") &&
        (!data.selfCollectLocation || data.selfCollectLocation.length === 0)
      ) {
        missing.push("Self-Collect Locations (at least one required if self-collect is selected)");
      }
    }
    return missing;
  };

  const commonFormDataSetup = (formData: FormData, data: ProductDataForApi) => {
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("stock", String(data.stock));
    formData.append("priceCredits", String(data.priceCredits));
    formData.append("price", String(data.price));
    formData.append("creatorUserId", data.creatorUserId);
    formData.append("creatorFullName", data.creatorFullName);
    formData.append("category", data.category);
    formData.append("subcategory", data.subcategory || "");
    formData.append("productType", data.productType);
    formData.append("slug", data.slugBase);

    if (data.dimensions) {
      formData.append("dimensions", JSON.stringify(data.dimensions));
    }
    // REMOVE: formData.append("singpostRoyalty", String(data.singpostRoyalty));
    // SingPost royalty is now part of deliveryTypes

    data.variants.forEach((v) => formData.append("variants", v));
    formData.append("deliveryTypes", JSON.stringify(data.deliveryTypes)); // This now carries the new structure
    (data.selfCollectLocation || []).forEach((loc: string) =>
      formData.append("selfCollectLocation[]", loc)
    );
  };

  // CREATE
  const handleCreate = async (e: React.FormEvent, data: ProductDataForApi) => {
    e.preventDefault();
    const missingFields = getEmptyFields(data);
    if (missingFields.length > 0) {
      alert("Please fill in the following fields before submitting:\n\n" + missingFields.join("\n"));
      return;
    }
    setMainLoading(true);
    const formData = new FormData();
    commonFormDataSetup(formData, data);
    data.newImages.forEach((img) => formData.append("images", img));
    data.newModels.forEach((model) => formData.append("models", model));

    try {
      const res = await fetch("/api/product", { method: "POST", body: formData });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Failed to create product and parse error."}));
        throw new Error(errorData.message || "Failed to create product");
      }
      onClose();
      if (onProductCreated) onProductCreated();
    } catch (err: any) {
      alert(`There was an error creating the product: ${err.message}`);
      console.error(err);
    } finally {
      setMainLoading(false);
    }
  };

  // EDIT
  const handleEdit = async (e: React.FormEvent, data: ProductDataForApi) => {
    e.preventDefault();
    if (!productForEditContext?._id) {
        alert("Product ID is missing for edit operation.");
        setMainLoading(false);
        return;
    }
    const missingFields = getEmptyFields(data);
    if (missingFields.length > 0) {
      alert("Please fill in the following fields before submitting:\n\n" + missingFields.join("\n"));
      return;
    }
    setMainLoading(true);
    const formData = new FormData();
    formData.append("id", productForEditContext._id);
    commonFormDataSetup(formData, data);
    formData.append("updatedAt", data.updatedAt || new Date().toISOString());
    data.newImages.forEach((imgFile) => formData.append("images", imgFile));
    (data.existingImageUrls || []).forEach((url) => formData.append("existingImages[]", url));
    data.newModels.forEach((modelFile) => formData.append("models", modelFile));
    (data.existingModelUrls || []).forEach((url) => formData.append("existingModels[]", url));

    try {
      const res = await fetch("/api/product", { method: "PUT", body: formData });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Failed to update product and parse error."}));
        throw new Error(errorData.message || "Failed to update product");
      }
      onClose();
      if (onProductUpdated) onProductUpdated();
    } catch (err: any) {
      alert(`There was an error updating the product: ${err.message}`);
      console.error(err);
    } finally {
      setMainLoading(false);
    }
  };

  // DELETE
  const handleDelete = async (): Promise<void> => {
    if (!productForEditContext?._id) {
        alert("Product ID is missing, cannot delete.");
        return;
    }
    if (
      !window.confirm(
        "Are you sure you want to delete this product? This cannot be undone."
      )
    )
      return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/product?id=${productForEditContext._id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Failed to delete product and parse error."}));
        throw new Error(errorData.message || "Failed to delete product");
      }
      onClose();
      if (onProductUpdated) onProductUpdated(); 
    } catch (err: any) {
      alert(`There was an error deleting the product: ${err.message}`);
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  return { handleCreate, handleEdit, handleDelete };
}
