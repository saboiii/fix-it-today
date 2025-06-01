import Image from "next/image";
import React from "react";
import { BsPlus } from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";

type Category = {
  label: string;
  subcategories: string[];
};

interface ProductDetailsProps {
  productType: string;
  handleProductTypeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  form: {
    name: string;
    description: string;
    [key: string]: any;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  category: string;
  handleCategoryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  subcategory: string;
  handleSubcategoryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  categories: Category[];
  variantInput: string;
  setVariantInput: (value: string) => void;
  handleAddVariant: () => void;
  variants: string[];
  handleRemoveVariant: (idx: number) => void;
  imagePreviews: string[];
  handleRemoveImage: (idx: number) => void;
  images: File[];
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  models: File[];
  handleModelChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  modelUrls: string[]; // CHANGED from modelNames
  handleRemoveModel: (idx: number) => void;
}

export default function ProductDetails({
  productType,
  handleProductTypeChange,
  form,
  handleChange,
  category,
  handleCategoryChange,
  subcategory,
  handleSubcategoryChange,
  categories,
  variantInput,
  setVariantInput,
  handleAddVariant,
  variants,
  handleRemoveVariant,
  imagePreviews,
  handleRemoveImage,
  images,
  handleImageChange,
  models,
  handleModelChange,
  modelUrls, // CHANGED from modelNames
  handleRemoveModel,
}: ProductDetailsProps) {
  return (
    <>
      <div className='gap-4 flex flex-col col-span-3 md:col-span-1 row-span-3'>
        {/* Product Type */}
        <div className="flex gap-2 items-center mb-2 w-full">
          <label className='flex gap-2 option-primary'>
            <input
              type="radio"
              name="productType" // Same name for mutual exclusivity
              value="print"
              checked={productType === 'print'} // Controlled by the productType prop
              onChange={handleProductTypeChange} // Calls the handler from useProductWindow
            /> Print
          </label>
          <label className='flex gap-2 option-primary'>
            <input
              type="radio"
              name="productType"
              value="other"
              checked={productType === 'other'}
              onChange={handleProductTypeChange}
            /> Other
          </label>
        </div>
        {/* Product Name */}
        <div className='flex flex-col justify-center items-start gap-2 w-full'>
          <label className="flex option-primary">Product Name *</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="flex oneLineInput"
          />
        </div>
        {/* Description */}
        <div className='flex flex-col justify-center items-start gap-2  w-full'>
          <label className="flex option-primary">Description *</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            maxLength={1000}
            required
            className="flex largeInput"
            rows={3}
            placeholder="Max 100 words"
          />
        </div>
        {/* Category & Subcategory */}
        <div className="flex flex-col justify-center items-start gap-4 w-full">
          <div className='flex-col flex gap-2 w-full'>
            <label className="flex option-primary">Category *</label>
            <select
              value={category}
              onChange={handleCategoryChange}
              required
              className="flex oneLineInput "
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.label} value={cat.label}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div className='flex-col flex gap-2  w-full'>
            <label className="flex option-primary">Subcategory</label>
            <select
              value={subcategory}
              onChange={handleSubcategoryChange}
              disabled={!category}
              required
              className="flex oneLineInput "
            >
              <option value="">Select Subcategory</option>
              {categories.find(cat => cat.label === category)?.subcategories.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        </div>
        {/* Variants */}
        <div className="flex flex-col justify-center items-start gap-2">
          <label className="flex option-primary">Variants</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={variantInput}
              onChange={e => setVariantInput(e.target.value)}
              className="flex oneLineInput"
              placeholder="Add a variant"
            />
            <button
              type="button"
              onClick={handleAddVariant}
              className="button-tertiary"
              disabled={variantInput.trim() === ""}
            >
              Add
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {variants.map((v, idx) => (
              <span key={idx} className="bg-text/5 px-2 py-1 rounded text-xs flex items-center gap-1">
                {v}
                <RxCross1 size={10} type="button" className='ml-1 cursor-pointer' onClick={() => handleRemoveVariant(idx)} />
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className='gap-4 flex flex-col justify-start gap-2 col-span-3 md:col-span-2 row-span-3'>
        {/* Product Images */}
        <div className='flex flex-col'>
          <div className='flex flex-col'>
            <label className="flex option-primary">Product Images *</label>
            <div className='flex flex-row gap-2'>
              <div className="flex gap-2 mt-2 flex-wrap">
                {imagePreviews.map((src, idx) => (
                  <div key={idx} className='relative'>
                    <Image
                      src={src}
                      alt={`Preview ${idx + 1}`}
                      loading="lazy"
                      width={80}
                      height={80}
                      quality={20}
                      className="w-20 h-20 object-cover rounded-md border-[0.5px] border-text/20"
                    />
                    <RxCross1
                      className="absolute top-1 right-1 cursor-pointer text-background bg-black/50 rounded-full p-0.5"
                      size={14}
                      onClick={() => handleRemoveImage(idx)}
                    />
                  </div>
                ))}
                <label
                  className={`w-20 h-20 flex items-center justify-center rounded-md border border-text/20 text-text/20 border-dashed duration-200 ease-in-out transition-colors
                    ${imagePreviews.length >= 7 ? "opacity-60 cursor-not-allowed hover:border-text/20 hover:text-text/20" : "hover:border-accent cursor-pointer hover:text-accent"}
                  `}
                  style={{ minWidth: 80, minHeight: 80 }}
                >
                  {imagePreviews.length >= 7 ? (
                    <span className="text-[10px] text-center font-semibold px-1">MAX PHOTOS</span>
                  ) : (
                    <BsPlus className="text-2xl pointer-events-none" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                    disabled={imagePreviews.length >= 7}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
        {/* Downloadable Assets (3D Models) */}
        <div className='flex flex-col gap-2'>
          <label className="flex option-primary">Downloadable Assets (3D Models)</label>
          <label className="button-tertiary cursor-pointer w-fit">
            Choose Files
            <input
              type="file"
              accept=".obj,.glb,.gltf,.stl,.blend,.fbx,.zip,.rar,.7z"
              multiple
              onChange={handleModelChange}
              style={{ display: "none" }}
            />
          </label>
          <ul className="flex flex-col text-xs">
            {/* Ensure modelUrls is not undefined before mapping */}
            {modelUrls && modelUrls.map((url, idx) => (
              <div className='gap-2 flex flex-row items-center justify-between' key={idx}>
                {/* Displaying the full URL might be long. Consider extracting the file name. */}
                <li className='flex truncate' title={url}>{url.substring(url.lastIndexOf('/') + 1)}</li>
                <RxCross1 className='flex cursor-pointer' onClick={() => handleRemoveModel(idx)} />
              </div>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}