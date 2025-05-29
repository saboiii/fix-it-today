import { useUser } from '@clerk/nextjs';
import React, { useState, useEffect } from 'react'
import { BsPlus } from 'react-icons/bs';
import { FaPlus } from 'react-icons/fa';
import { RxCross1 } from 'react-icons/rx'

const printCategories = [
    { label: "Trending Prints", subcategories: ["Popular", "New Arrivals", "Editor's Picks"] },
    { label: "Games", subcategories: ["Board Games", "Miniatures", "Accessories"] },
    { label: "Educational", subcategories: ["STEM", "Models", "Teaching Aids"] },
    { label: "Display", subcategories: ["Figurines", "Art", "Props"] },
    { label: "For Him", subcategories: ["Gadgets", "Tools", "Toys"] },
    { label: "Adda", subcategories: ["Community", "Events", "Meetups"] },
];

const otherCategories = [
    { label: "Electronics", subcategories: ["Microcontrollers", "Sensors", "Displays", "Motors", "Power Supplies"] },
    { label: "Filament", subcategories: ["PLA", "ABS", "PETG", "TPU", "Specialty"] },
    { label: "Printer", subcategories: ["FDM Printers", "Resin Printers", "Parts & Upgrades", "Maintenance", "Enclosures"] },
    { label: "Accessories", subcategories: ["Nozzles", "Build Plates", "Tools", "Storage", "Cleaning"] },
    { label: "Power Tools", subcategories: ["Drills", "Soldering Irons", "Rotary Tools", "Heat Guns", "Cutters"] },
    { label: "Gears", subcategories: ["Belts & Pulleys", "Bearings", "Lead Screws", "Couplers", "Stepper Motors"] },
];

function CreateProductWindow({ onClose, product }: { onClose: () => void, product?: any }) {
    const { user } = useUser();
    const [productType, setProductType] = useState<'print' | 'other'>('print');
    const [category, setCategory] = useState('');
    const [subcategory, setSubcategory] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [models, setModels] = useState<File[]>([]);
    const [modelNames, setModelNames] = useState<string[]>([]);
    const [variants, setVariants] = useState<string[]>([]);
    const [variantInput, setVariantInput] = useState('');
    const [form, setForm] = useState({
        name: '',
        description: '',
        stock: 0,
        priceCredits: 0,
        price: 0,
        creatorUserId: '',
        creatorFullName: '',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setForm(prev => ({
                ...prev,
                creatorUserId: user.id,
                creatorFullName: user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim(),
            }));
        }
    }, [user]);

    // On mount, if product is provided, prefill the form
    useEffect(() => {
        if (product) {
            setForm({
                name: product.name || '',
                description: product.description || '',
                stock: product.stock || 0,
                priceCredits: product.priceCredits || 0,
                price: product.price || 0,
                creatorUserId: product.creatorUserId || '',
                creatorFullName: product.creatorFullName || '',
            });
            setCategory(product.category || '');
            setSubcategory(product.subcategory || '');
            setVariants(product.variants || []);
            setImagePreviews(product.images || []);
            setModelNames(product.downloadableAssets?.map((url: string) => url.split('/').pop()) || []);
            // You may want to fetch the actual files for editing, or just show previews
        }
    }, [product]);

    // Handle image uploads and previews
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setImages(prev => [...prev, ...files]);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = ev => {
                setImagePreviews(prev => [...prev, ev.target?.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    // Handle model uploads
    const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setModels(prev => [...prev, ...files]);
        setModelNames(prev => [...prev, ...files.map(f => f.name)]);
    };

    // Handle variant add
    const handleAddVariant = () => {
        if (variantInput.trim()) {
            setVariants(prev => [...prev, variantInput.trim()]);
            setVariantInput('');
        }
    };

    // Handle variant remove
    const handleRemoveVariant = (idx: number) => {
        setVariants(prev => prev.filter((_, i) => i !== idx));
    };

    const handleRemoveModel = (idx: number) => {
        setModels(prev => prev.filter((_, i) => i !== idx));
        setModelNames(prev => prev.filter((_, i) => i !== idx));
        // If editing, also remove from product.downloadableAssets if present
        if (product && product.downloadableAssets) {
            product.downloadableAssets = product.downloadableAssets.filter((_: string, i: number) => i !== idx);
        }
    };

    const handleRemoveImage = (idx: number) => {
        if (idx >= (imagePreviews.length - images.length)) {
            const newImageFileIndex = idx - (imagePreviews.length - images.length);
            setImages(prev => prev.filter((_, i) => i !== newImageFileIndex));
        }
        setImagePreviews(prev => prev.filter((_, i) => i !== idx));
    };


    // Handle form field changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    // Handle category change
    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCategory(e.target.value);
        setSubcategory('');
    };

    // Handle subcategory change
    const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSubcategory(e.target.value);
    };

    // Handle product type change
    const handleProductTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProductType(e.target.value as 'print' | 'other');
        setCategory('');
        setSubcategory('');
    };

    // Handle form submit for creating a product
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("description", form.description);
        formData.append("stock", String(form.stock));
        formData.append("priceCredits", String(form.priceCredits));
        formData.append("price", String(form.price));
        formData.append("creatorUserId", form.creatorUserId);
        formData.append("creatorFullName", form.creatorFullName);
        formData.append("category", category);
        formData.append("subcategory", subcategory);
        formData.append("productType", productType);

        // Variants
        variants.forEach(v => formData.append("variants", v));

        // Images
        images.forEach(img => formData.append("images", img));

        // Models
        models.forEach(model => formData.append("models", model));

        try {
            const res = await fetch("/api/product", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                throw new Error("Failed to create product");
            }

            alert("Product created!");
            onClose();
        } catch (err) {
            alert("There was an error creating the product.");
        } finally {
            setLoading(false);
        }
    };

    // Handle form submit for editing a product
    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        formData.append("id", product._id); // Pass the product id for editing
        formData.append("name", form.name);
        formData.append("description", form.description);
        formData.append("stock", String(form.stock));
        formData.append("priceCredits", String(form.priceCredits));
        formData.append("price", String(form.price));
        formData.append("creatorUserId", form.creatorUserId);
        formData.append("creatorFullName", form.creatorFullName);
        formData.append("category", category);
        formData.append("subcategory", subcategory);
        formData.append("productType", productType);

        // Variants
        variants.forEach(v => formData.append("variants", v));

        // Images
        images.forEach(img => formData.append("images", img));
        // Also add existing image URLs if editing and not replaced
        if (imagePreviews.length && images.length < imagePreviews.length) {
            imagePreviews.slice(images.length).forEach(url => formData.append("images", url));
        }

        // Models
        models.forEach(model => formData.append("models", model));
        // Also add existing model URLs if editing and not replaced
        if (modelNames.length && models.length < modelNames.length) {
            (product.downloadableAssets as string[] | undefined)?.slice(models.length).forEach((url: string) => formData.append("models", url));
        }

        try {
            const res = await fetch("/api/product", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                throw new Error("Failed to update product");
            }

            alert("Product updated!");
            onClose();
        } catch (err) {
            alert("There was an error updating the product.");
        } finally {
            setLoading(false);
        }
    };

    const categories = productType === 'print' ? printCategories : otherCategories;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-[60]">
            <div className="bg-background border border-neutral-900 rounded-xl w-full max-w-3xl max-h-[90vh] p-4 flex flex-col">
                <div className="relative flex flex-row items-center justify-start">
                    <RxCross1
                        className="absolute cursor-pointer opacity-100 hover:opacity-50 transition-opacity ease-in-out right-2 top-2"
                        onClick={onClose}
                        aria-label="Close create product window"
                        size={15}
                    />
                </div>
                <form
                    className="grid grid-cols-3 grid-rows-3 p-6 gap-6"
                    onSubmit={product ? handleEdit : handleCreate}
                >
                    <div className='gap-4 flex flex-col col-span-1 row-span-3'>
                        {/* Product Type */}
                        <div className="flex gap-2 items-center mb-2 w-full">
                            <label className='flex gap-2 option-primary'>
                                <input
                                    type="radio"
                                    name="productType"
                                    value="print"
                                    checked={productType === 'print'}
                                    onChange={handleProductTypeChange}
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



                    <div className='gap-4 flex flex-col justify-between col-span-2 row-span-3'>

                        {/* Product Images */}
                        <div className='flex flex-col'>
                            <div className='flex flex-col'>
                                <label className="flex option-primary">Product Images *</label>
                                <div className='flex flex-row gap-2'>
                                    <div className="flex gap-2 mt-2 flex-wrap">
                                        {imagePreviews.map((src, idx) => (
                                            <div key={idx} className='relative'>
                                                <img
                                                    src={src}
                                                    alt={`Preview ${idx + 1}`}
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
                                            className={`w-20 h-20 flex items-center justify-center rounded-md border border-text/20 text-text/20 border-dashed cursor-pointer duration-200 ease-in-out transition-colors
            ${images.length >= 7 ? "opacity-60 cursor-not-allowed hover:border-text/20 hover:text-text/20" : "hover:border-accent hover:text-accent"}
        `}
                                            style={{ minWidth: 80, minHeight: 80 }}
                                        >
                                            {images.length >= 7 ? (
                                                <span className="text-[10px] text-center font-semibold px-1">MAX PHOTOS REACHED</span>
                                            ) : (
                                                <BsPlus className="text-2xl pointer-events-none" />
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleImageChange}
                                                style={{ display: "none" }}
                                                disabled={images.length >= 7}
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
                                {modelNames.map((name, idx) => (
                                    <div className='gap-2 flex flex-row items-center justify-between' key={idx}>
                                        <li className='flex'>{name}</li>
                                        <RxCross1 className='flex cursor-pointer' onClick={() => handleRemoveModel(idx)} />
                                    </div>
                                ))}
                            </ul>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className={`button-primary mt-4 flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed disabled:pointer-events-none`}
                            disabled={loading}
                        >
                            {loading && (
                                <span className="inline-block h-3 w-3 border border-text border-t-transparent rounded-full animate-spin"></span>
                            )}
                            {loading
                                ? product ? "Editing..." : "Creating..."
                                : product ? "Edit Product" : "Create Product"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )
}

export default CreateProductWindow