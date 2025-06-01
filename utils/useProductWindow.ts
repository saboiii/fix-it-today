import { useState, useEffect } from "react";
import { PRINT_CATEGORIES, SHOP_CATEGORIES } from "@/lib/constants";
import { useProductForm } from "./useProductForm";
import { useFileUploads } from "./useFileUploads";
import { useVariants } from "./useVariants";
import { useDeliveryOptions } from "./useDeliveryOptions";
import { useProductCrud } from "./useProductCrud";
import { generateSlug } from "@/utils/productHelpers"; // Assuming you have this

export function useProductWindow(
  product: Product | undefined,
  onClose: () => void,
  onProductCreated?: () => void,
  onProductUpdated?: () => void
) {
  const formState = useProductForm(product);
  const fileUploads = useFileUploads(product);
  const variantsState = useVariants(product?.variants);
  const deliveryState = useDeliveryOptions(product); // deliveryState.deliveryTypes will be updated by effect below

  const [option, setOption] = useState<PWSidebarOptions>("Product Details");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mainLoading, setMainLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [category, setCategory] = useState(product?.category || "");
  const [subcategory, setSubcategory] = useState(product?.subcategory || "");
  const [productType, setProductType] = useState<"print" | "other">(() => {
    if (product?.productType) return product.productType; // For editing
    // For editing, if productType is missing but category implies it.
    // Note: The original comparison `PRINT_CATEGORIES.some(pc => String(pc) === String(product.category))`
    // is likely incorrect if PRINT_CATEGORIES are objects. It should be something like:
    // if (product?.category && PRINT_CATEGORIES.some(pc => pc.label === product.category)) return "print";
    // However, this part only affects editing mode.
    return "other"; // Default for NEW product
  });
  const [dimensions, setDimensions] = useState(
    product?.dimensions || { length: 0, width: 0, height: 0, weight: 0 }
  );

  // Initialize singpostFee and singpostRoyalty from the new structure
  const [singpostRoyalty, setSingpostRoyalty] = useState<number>(() => {
    const singpostEntry = product?.delivery?.deliveryTypes?.find(dt => dt.type === 'singpost');
    if (singpostEntry && typeof singpostEntry.price === 'object' && singpostEntry.price !== null) {
      return (singpostEntry.price as { fee: number; royalty: number }).royalty || 0;
    }
    return 0;
  });

  const [singpostFee, setSingpostFee] = useState<number | null>(() => {
    const singpostEntry = product?.delivery?.deliveryTypes?.find(dt => dt.type === 'singpost');
    if (singpostEntry && typeof singpostEntry.price === 'object' && singpostEntry.price !== null) {
      return (singpostEntry.price as { fee: number; royalty: number }).fee;
    }
    // If not editing, or no SingPost, or not calculated yet, it can be null
    // Or, if you want to calculate it based on dimensions on load (if product has dimensions):
    // if (product?.dimensions) {
    //   return calculateSingpostFee(product.dimensions); // Assuming calculateSingpostFee is available
    // }
    return null;
  });

  const categories = productType === "print" ? PRINT_CATEGORIES : SHOP_CATEGORIES;

  // Effect to update the SingPost price object in deliveryTypes
  useEffect(() => {
    const isSingpostSelected = deliveryState.deliveryTypes.some(dt => dt.type === 'singpost');
    if (isSingpostSelected && singpostFee !== null) { // singpostFee is the base fee from state
      const currentSingpostEntry = deliveryState.deliveryTypes.find(dt => dt.type === 'singpost');
      if (currentSingpostEntry) {
        // Ensure price is an object before trying to access fee/royalty
        const currentPriceObj = currentSingpostEntry.price as { fee: number; royalty: number };
        
        // Only update if fee or royalty has actually changed
        if (currentPriceObj?.fee !== singpostFee || currentPriceObj?.royalty !== singpostRoyalty) {
          deliveryState.setDeliveryTypes(prevDeliveryTypes =>
            prevDeliveryTypes.map(dt =>
              dt.type === 'singpost'
                ? { ...dt, price: { fee: singpostFee, royalty: singpostRoyalty } }
                : dt
            )
          );
        }
      }
    }
    // Do not include deliveryState.setDeliveryTypes in dependencies if it causes loops,
    // React guarantees setter functions are stable.
    // deliveryState.deliveryTypes is needed to react to external changes or initial load.
  }, [singpostRoyalty, singpostFee, deliveryState.deliveryTypes, deliveryState.setDeliveryTypes]);


  const crudActions = useProductCrud({
    productForEditContext: product,
    onClose,
    onProductCreated,
    onProductUpdated,
    setMainLoading,
    setDeleting,
  });

  const getProductDataForApi = (): ProductDataForApi => {
    if (!formState.form.creatorUserId || !formState.form.creatorFullName) {
      console.error("CRITICAL: Creator User ID or Full Name is missing from form state.");
    }
    return {
      id: product?._id,
      name: formState.form.name,
      description: formState.form.description,
      stock: formState.form.stock,
      priceCredits: formState.form.priceCredits,
      price: formState.form.price,
      creatorUserId: formState.form.creatorUserId,
      creatorFullName: formState.form.creatorFullName,
      category: category,
      subcategory: subcategory,
      productType: productType,
      slugBase: generateSlug(formState.form.name),

      newImages: fileUploads.images,
      existingImageUrls: fileUploads.imagePreviews.filter(url => !url.startsWith("blob:")),
      newModels: fileUploads.models,
      existingModelUrls: fileUploads.modelUrls.filter(url => !url.startsWith("blob:")),

      variants: variantsState.variants,
      deliveryTypes: deliveryState.deliveryTypes, // This now contains the new SingPost structure
      selfCollectLocation: deliveryState.selfCollectLocation,
      dimensions: dimensions,
      // singpostRoyalty is no longer a top-level field here
      updatedAt: product ? new Date().toISOString() : undefined,
    };
  };

  const wrappedHandleCreate = (e: React.FormEvent) => {
    const data = getProductDataForApi();
    crudActions.handleCreate(e, data);
  };

  const wrappedHandleEdit = (e: React.FormEvent) => {
    const data = getProductDataForApi();
    crudActions.handleEdit(e, data);
  };
  
  const handleSidebarToggle = () => setSidebarOpen((prev) => !prev);
  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setCategory(e.target.value);
    setSubcategory("");
  };
  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSubcategory(e.target.value);
  };
  const handleProductTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductType(e.target.value as "print" | "other");
    setCategory("");
    setSubcategory("");
  };

  return {
    form: formState.form,
    handleChange: formState.handleChange,
    ...fileUploads,
    ...variantsState,
    // Return deliveryState and its specific handlers needed by SalesInformation
    deliveryTypes: deliveryState.deliveryTypes, // Pass the raw deliveryTypes
    setDeliveryTypes: deliveryState.setDeliveryTypes, // Pass the setter for the effect
    shippingFee: deliveryState.shippingFee,
    handleDeliveryTypeChange: deliveryState.handleDeliveryTypeChange,
    handleShippingFeeChange: deliveryState.handleShippingFeeChange,
    selfCollectLocationInput: deliveryState.selfCollectLocationInput,
    selfCollectLocation: deliveryState.selfCollectLocation,
    handleSelfCollectLocationChange: deliveryState.handleSelfCollectLocationChange,
    
    option, setOption,
    sidebarOpen, handleSidebarToggle,
    mainLoading, 
    deleting, 
    category, handleCategoryChange,
    subcategory, handleSubcategoryChange,
    productType, handleProductTypeChange,
    dimensions, setDimensions,
    singpostRoyalty, setSingpostRoyalty, // For SalesInformation UI
    singpostFee, setSingpostFee,         // For SalesInformation UI
    categories,
    productDataForContext: product,
    handleCreate: wrappedHandleCreate,
    handleEdit: wrappedHandleEdit,
    handleDelete: crudActions.handleDelete,
    onClose,
  };
}
