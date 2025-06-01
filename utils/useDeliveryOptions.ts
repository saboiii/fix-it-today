import { useState, useEffect, useCallback } from "react";

export function useDeliveryOptions(product?: Product) {
  const [deliveryTypes, setDeliveryTypes] = useState<DeliveryType[]>([]);
  const [shippingFee, setShippingFee] = useState<string>(""); // For private shipping input
  const [selfCollectLocationInput, setSelfCollectLocationInput] = useState<string>("");
  const [selfCollectLocation, setSelfCollectLocation] = useState<string[]>([]);

  useEffect(() => {
    if (product?.delivery?.deliveryTypes) {
      setDeliveryTypes(product.delivery.deliveryTypes);
      
      // Initialize shippingFee input if private shipping exists
      const privateShipping = product.delivery.deliveryTypes.find(dt => dt.type === 'private');
      if (privateShipping && typeof privateShipping.price === 'number') {
        setShippingFee(String(privateShipping.price));
      }
      
      // Initialize selfCollectLocationInput if self-collect exists
      if (product.delivery.selfCollectLocation && product.delivery.selfCollectLocation.length > 0) {
        setSelfCollectLocation(product.delivery.selfCollectLocation);
        setSelfCollectLocationInput(product.delivery.selfCollectLocation.join(", "));
      } else {
        setSelfCollectLocation([]);
        setSelfCollectLocationInput("");
      }

    } else {
      // Reset if no product or no delivery types
      setDeliveryTypes([]);
      setShippingFee("");
      setSelfCollectLocationInput("");
      setSelfCollectLocation([]);
    }
  }, [product]);

  const handleDeliveryTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setDeliveryTypes((prev) => {
      if (checked) {
        if (value === "self-collect") {
          return [...prev, { type: "self-collect", price: 0 }]; // Price for self-collect is typically 0
        }
        if (value === "singpost") {
          // Initialize SingPost with fee and royalty structure
          return [...prev, { type: "singpost", price: { fee: 0, royalty: 0 } }];
        }
        // For other types like "private", default price to 0, actual fee set via handleShippingFeeChange
        return [...prev, { type: value, price: 0 }];
      } else {
        // If unchecking "private", also clear its shippingFee input
        if (value === "private") {
            setShippingFee("");
        }
        return prev.filter((dt) => dt.type !== value);
      }
    });
  };

  const handleShippingFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFeeValue = e.target.value;
    setShippingFee(newFeeValue); // Keep the shippingFee state in sync for the input field
    setDeliveryTypes((prev) =>
      prev.map((dt) =>
        dt.type === "private" ? { ...dt, price: Number(newFeeValue) || 0 } : dt
      )
    );
  };

  const handleSelfCollectLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputText = e.target.value;
    setSelfCollectLocationInput(inputText);
    const locationsArray = inputText.split(',').map(loc => loc.trim()).filter(loc => loc !== "");
    setSelfCollectLocation(locationsArray);
    // No need to update deliveryTypes here directly for self-collect price, as it's fixed at 0
  };

  return {
    deliveryTypes,
    setDeliveryTypes, // Expose this for direct manipulation by useProductWindow's effect
    shippingFee, // For private shipping input binding
    handleDeliveryTypeChange,
    handleShippingFeeChange,
    selfCollectLocationInput, // For self-collect input binding
    selfCollectLocation, // The array of locations for ProductDataForApi
    handleSelfCollectLocationChange,
  };
}
