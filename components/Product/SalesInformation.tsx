import { calculateSingpostFee } from "@/utils/productHelpers";
import React from "react";

type SalesInformationProps = {
  selfCollectLocation: string[];
  form: any;
  deliveryTypes: DeliveryType[]; // Use the global DeliveryType
  setDeliveryTypes: React.Dispatch<React.SetStateAction<DeliveryType[]>>; // Also use the global DeliveryType
  handleChange: React.ChangeEventHandler<HTMLInputElement>;
  singpostFee: number | null;
  singpostRoyalty: number;
  shippingFee: string;
  setSingpostRoyalty: (value: number) => void;
  dimensions: Dimensions;
  setDimensions: React.Dispatch<React.SetStateAction<Dimensions>>;
  setSingpostFee: (fee: number | null) => void;
  handleDeliveryTypeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleShippingFeeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selfCollectLocationInput: string;
  handleSelfCollectLocationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

};
export default function SalesInformation({
  form,
  deliveryTypes,
  setDeliveryTypes,
  handleChange,
  singpostFee,
  singpostRoyalty,
  setSingpostRoyalty,
  dimensions,
  setDimensions,
  setSingpostFee,
  handleDeliveryTypeChange,
  handleShippingFeeChange,
  handleSelfCollectLocationChange,
  selfCollectLocationInput,
}: SalesInformationProps) {
  return (
    <div className="flex flex-col col-span-3 gap-6">
      <h2 className="text-lg font-semibold mb-4">Sales Information</h2>
      <div className='flex flex-row gap-2'>
        {/* Stock */}
        <div className="flex flex-col justify-center items-start gap-2 w-full max-w-xs">
          <label className="flex option-primary">Stock *</label>
          <input
            type="number"
            name="stock"
            min={0}
            value={form.stock}
            onChange={handleChange}
            required
            className="flex oneLineInput"
          />
        </div>
        {/* Price */}
        <div className="flex flex-col justify-center items-start gap-2 w-full max-w-xs">
          <label className="flex option-primary">Price (SGD) *</label>
          <input
            type="number"
            name="price"
            min={0}
            step="0.01"
            value={form.price}
            onChange={handleChange}
            required
            className="flex oneLineInput"
          />
        </div>
        {/* Credits */}
        <div className="flex flex-col justify-center items-start gap-2 w-full max-w-xs">
          <label className="flex option-primary">Price (Credits) *</label>
          <input
            type="number"
            name="priceCredits"
            min={0}
            step="0.01"
            value={form.priceCredits}
            onChange={handleChange}
            required
            className="flex oneLineInput"
          />
        </div>
      </div>
      {/* Delivery Options */}
      <div className="flex flex-col justify-center items-start gap-2 w-full">
        <label className="flex option-primary">Delivery Options *</label>
        <div className="flex flex-col gap-2">
          {/* SingPost */}
          <label className="flex items-center gap-2 option-primary">
            <input
              type="checkbox"
              name="deliveryTypes"
              value="singpost"
              checked={deliveryTypes?.some((dt: DeliveryType) => dt.type === "singpost")}
              onChange={handleDeliveryTypeChange as React.ChangeEventHandler<HTMLInputElement>}
            />
            SingPost: Normal Mail (Standard rates apply)
          </label>
          {deliveryTypes?.some((dt: DeliveryType) => dt.type === "singpost") && (
            <div className="flex flex-col gap-2 ml-6 border-l border-text/10 pl-4">
              <div className="flex gap-4">
                <div className="flex flex-col">
                  <label className="uppercase font-semibold text-[8px]">Length (mm)</label>
                  <input
                    type="number"
                    min={1}
                    className="oneLineInput"
                    value={dimensions.length}
                    onChange={e => setDimensions(d => ({ ...d, length: Number(e.target.value) }))}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="uppercase font-semibold text-[8px]">Width (mm)</label>
                  <input
                    type="number"
                    min={1}
                    className="oneLineInput"
                    value={dimensions.width}
                    onChange={e => setDimensions(d => ({ ...d, width: Number(e.target.value) }))}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="uppercase font-semibold text-[8px]">Height (mm)</label>
                  <input
                    type="number"
                    min={1}
                    className="oneLineInput"
                    value={dimensions.height}
                    onChange={e => setDimensions(d => ({ ...d, height: Number(e.target.value) }))}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="uppercase font-semibold text-[8px]">Weight (kg)</label>
                  <input
                    type="number"
                    min={0.01}
                    step={0.01}
                    className="oneLineInput"
                    value={dimensions.weight}
                    onChange={e => setDimensions(d => ({ ...d, weight: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <button
                type="button"
                className="button-tertiary w-fit mt-2"
                onClick={() => {
                  const fee = calculateSingpostFee({
                    length: Number(dimensions.length),
                    width: Number(dimensions.width),
                    height: Number(dimensions.height),
                    weight: Number(dimensions.weight),
                  });
                  setSingpostFee(fee);

                }}
              >
                Calculate SingPost Fee
              </button>
              {singpostFee !== null && (
                <div className="flex flex-col gap-1">
                  <div className="text-sm">
                    <span className="font-semibold">SingPost Fee: </span>
                    <span>${singpostFee.toFixed(2)} SGD</span>
                  </div>
                  <label className="option-primary text-xs mt-2">Extra Royalty (SGD)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className="oneLineInput"
                    value={singpostRoyalty}
                    onChange={e => {
                      const value = e.target.value;
                      setSingpostRoyalty(value === '' ? 0 : Number(value)); // Handle empty string case
                    }}
                  />
                  <div className="text-sm mt-1">
                    <span className="font-semibold">Total Delivery Fee: </span>
                    <span>${(singpostFee + (singpostRoyalty || 0)).toFixed(2)} SGD</span>
                  </div>
                </div>
              )}
              {singpostFee === null && (
                <div className="text-xs text-red-500 mt-2">Dimensions/weight do not fit any SingPost category.</div>
              )}
            </div>
          )}
          {/* Private Shipping */}
          <label className="flex items-center gap-2 option-primary">
            <input
              type="checkbox"
              name="deliveryTypes"
              value="private"
              checked={deliveryTypes?.some((dt: DeliveryType) => dt.type === "private")}
              onChange={handleDeliveryTypeChange}
            />
            Private Shipping
          </label>
          {deliveryTypes?.some((dt: DeliveryType) => dt.type === "private") && (
            <div className="flex flex-col gap-1 ml-6">
              <label className="option-primary text-xs">Shipping Fee (SGD)</label>
              <input
                type="number"
                name="shippingFee"
                min={0}
                step="0.01"
                value={
                  (() => {
                    const price = deliveryTypes.find(dt => dt.type === "private")?.price;
                    if (typeof price === "object" && price !== null) {
                      return price.fee ?? "";
                    }
                    return price ?? "";
                  })()
                }
                onChange={handleShippingFeeChange}
                className="oneLineInput"
              />
            </div>
          )}
          {/* Self-Collect */}
          <label className="flex items-center gap-2 option-primary">
            <input
              type="checkbox"
              name="deliveryTypes"
              value="self-collect"
              checked={deliveryTypes?.some((dt: DeliveryType) => dt.type === "self-collect")}
              onChange={handleDeliveryTypeChange}
            />
            Self-Collect
          </label>
          {deliveryTypes?.some((dt: DeliveryType) => dt.type === "self-collect") && (
            <div className="flex flex-col gap-1 ml-6">
              <label className="option-primary text-xs">Locations (comma separated)</label>
              <input
                type="text"
                name="selfCollectLocation"
                value={selfCollectLocationInput}
                onChange={handleSelfCollectLocationChange}
                className="oneLineInput"
                placeholder="e.g. Orchard MRT, Pioneer MRT, etc."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}