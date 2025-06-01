import React from 'react';
import { RxCross1 } from 'react-icons/rx';
import Sidebar from './Window/Sidebar';
import ProductDetails from './Product/ProductDetails';
import SalesInformation from './Product/SalesInformation';
import PromotionSection from './Product/PromotionSection';
import ConfirmationSection from './Product/ConfirmationSection';
import { useProductWindow } from '@/utils/useProductWindow';

interface ProductWindowProps {
    onClose: () => void;
    product?: Product; 
    onProductCreated?: () => void;
    onProductUpdated?: () => void;
}

function ProductWindow({ onClose, product, onProductCreated, onProductUpdated }: ProductWindowProps) {
    const {
        option,
        setOption,
        sidebarOpen,
        handleSidebarToggle,
        form,
        handleChange,
        images,
        imagePreviews,
        handleImageChange,
        handleRemoveImage,
        models,
        modelUrls,
        handleModelChange,
        handleRemoveModel,
        deliveryTypes,
        setDeliveryTypes,
        selfCollectLocation,
        selfCollectLocationInput,
        singpostFee,
        shippingFee,
        singpostRoyalty,
        setSingpostRoyalty,
        dimensions,
        setDimensions,
        setSingpostFee,
        handleDeliveryTypeChange,
        handleShippingFeeChange,
        handleSelfCollectLocationChange,
        mainLoading,
        productDataForContext, // Changed from 'product'
        handleDelete,
        deleting,
        productType, // <<< MAKE SURE YOU ARE DESTRUCTURING productType FROM useProductWindow
        handleProductTypeChange,
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
        handleCreate, // This is now the wrapped version
        handleEdit,   // This is now the wrapped version
    } = useProductWindow(product, onClose, onProductCreated, onProductUpdated);

    return (
        <div className="fixed left-0 top-0 px-4 py-8 flex w-screen h-screen items-center justify-center bg-black/80 z-[60]">
            <div className="relative flex flex-row w-full h-full md:w-4xl md:h-[75vh] product-window overflow-hidden">
                <RxCross1
                    className="absolute cursor-pointer opacity-100 hover:opacity-50 transition-opacity ease-in-out right-2 top-2 z-[80]"
                    onClick={onClose}
                    aria-label="Close create product window"
                    size={15}
                />
                <Sidebar setOption={setOption} sidebarOpen={sidebarOpen} onSidebarToggle={handleSidebarToggle} />
                <div className={`absolute w-full transition-all duration-300 ease-in-out ml-12 py-8 pl-8 pr-20`}>
                    <form
                        className="grid grid-cols-3 grid-rows-3 gap-6"
                        onSubmit={productDataForContext ? handleEdit : handleCreate}
                    >
                        {option === "Product Details" && (
                            <ProductDetails
                                productType={productType}
                                handleProductTypeChange={handleProductTypeChange}
                                form={form}
                                handleChange={handleChange}
                                category={category}
                                handleCategoryChange={handleCategoryChange}
                                subcategory={subcategory}
                                handleSubcategoryChange={handleSubcategoryChange}
                                categories={categories}
                                variantInput={variantInput}
                                setVariantInput={setVariantInput}
                                handleAddVariant={handleAddVariant}
                                variants={variants}
                                handleRemoveVariant={handleRemoveVariant}
                                imagePreviews={imagePreviews}
                                handleRemoveImage={handleRemoveImage}
                                images={images}
                                handleImageChange={handleImageChange}
                                models={models}
                                handleModelChange={handleModelChange}
                                modelUrls={modelUrls}
                                handleRemoveModel={handleRemoveModel}
                            />
                        )}
                        {option === "Sales Information" && (
                            <SalesInformation
                                deliveryTypes={deliveryTypes}
                                setDeliveryTypes={setDeliveryTypes}
                                selfCollectLocation={selfCollectLocation}
                                selfCollectLocationInput={selfCollectLocationInput}
                                form={form}
                                handleChange={handleChange}
                                singpostFee={singpostFee}
                                shippingFee={shippingFee} 
                                singpostRoyalty={singpostRoyalty}
                                setSingpostRoyalty={setSingpostRoyalty}
                                dimensions={dimensions}
                                setDimensions={setDimensions}
                                setSingpostFee={setSingpostFee}
                                handleDeliveryTypeChange={handleDeliveryTypeChange}
                                handleShippingFeeChange={handleShippingFeeChange}
                                handleSelfCollectLocationChange={handleSelfCollectLocationChange}
                            />
                        )}
                        {option === "Promotion" && <PromotionSection />}
                        {option === "Confirmation" && (
                            <ConfirmationSection
                                mainLoading={mainLoading}
                                product={productDataForContext}
                                handleDelete={handleDelete}
                                deleting={deleting}
                            />
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ProductWindow;