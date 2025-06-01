export {};

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      onboardingComplete?: boolean;
    };
  }

  type PWSidebarOptions =
    | "Product Details"
    | "Promotion"
    | "Sales Information"
    | "Confirmation";

  // Nested types based on Mongoose Schemas
  interface Rating {
    _id?: string; // Mongoose adds _id by default
    title?: string;
    description?: string;
    images?: string[];
    rating?: number; // 0-5
  }

  type Dimensions = {
    length: number;
    width: number;
    height: number;
    weight: number;
  };

  type DeliveryType = {
    type: string;
    price: number | { fee: number; royalty: number };
  };
  interface Discount {
    _id?: string; // Mongoose adds _id by default
    eventName?: string;
    discount?: number; // 0-100
    startDate: string | Date; // Store as ISO string or Date
    endDate: string | Date; // Store as ISO string or Date
    isActive?: boolean;
  }

  interface Product {
    _id?: string;
    creatorUserId: string; // Required in schema
    creatorFullName: string; // Required in schema
    name: string; // Required in schema
    description: string; // Required in schema, maxlength 1000
    images: string[]; // Required in schema, URLs of product images
    downloadableAssets?: string[]; // URLs of downloadable files (e.g., 3D models)

    dateReleased: string | Date; // Required in schema

    // Sales Information
    price: number; // Required in schema, Price in SGD
    priceCredits: number; // Required in schema, Price in credits
    stock?: number; // Defaults to 0 in schema

    // Product Categorization & Type
    productType?: "print" | "other"; // Not directly in schema, but used in frontend logic
    category: string; // Required in schema
    subcategory?: string;
    variants?: string[];

    // Delivery Options
    // Matching the 'delivery' object structure in the schema
    delivery?: {
      deliveryTypes?: DeliveryType[]; // CHANGED: Use the updated DeliveryType
      selfCollectLocation?: string[];
    };

    // SingPost Specific (if applicable, often part of frontend logic or derived)
    dimensions?: Dimensions; // Re-using the Dimensions type

    // Fields from ProductSchema
    downloads?: number; // Defaults to 0
    prints?: number; // Defaults to 0
    numberSold?: number; // Defaults to 0
    ratings?: Rating[];
    discount?: Discount[]; // Array of discounts

    likes?: string[]; // Array of User IDs, defaults to []
    views?: number; // Defaults to 0
    hidden?: boolean; // Defaults to false
    flaggedForModeration?: boolean; // Defaults to false
    slug?: string; // Unique

    createdAt?: string | Date;
    updatedAt?: string | Date;
  }

  // New type for data passed to useProductCrud
  interface ProductDataForApi {
    id?: string; // For edit context
    name: string;
    description: string;
    stock: number;
    priceCredits: number;
    price: number;
    creatorUserId: string; // Ensure this is sourced correctly (e.g., from session or form)
    creatorFullName: string; // Ensure this is sourced correctly
    category: string;
    subcategory: string;
    productType: "print" | "other";

    // From useFileUploads
    newImages: File[];
    existingImageUrls: string[]; // S3 URLs to keep (for edit)
    newModels: File[];
    existingModelUrls: string[]; // S3 URLs to keep (for edit)

    // From useVariants
    variants: string[];

    // From useDeliveryOptions & useProductWindow state
    deliveryTypes: DeliveryType[]; // CHANGED: Use the updated DeliveryType
    selfCollectLocation: string[];
    dimensions?: Dimensions;

    // For slug generation/update
    slugBase: string;
    updatedAt?: string; // For edit, to be set by frontend
  }
}
