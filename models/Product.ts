import mongoose from "mongoose";

// Define the DeliveryTypeSchema first
const DeliveryTypeSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    price: {
      type: mongoose.Schema.Types.Mixed, // CHANGED: Allow mixed types (Number or Object)
      required: true,
    },
  },
  { _id: false } // _id: false if you don't need individual IDs for delivery types
);

const ProductSchema = new mongoose.Schema(
  {
    creatorUserId: { type: String, required: true },
    creatorFullName: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    images: { type: [String], default: [] },
    downloadableAssets: { type: [String], default: [] },
    dateReleased: { type: Date, default: Date.now },
    price: { type: Number, required: true }, // Main product price
    priceCredits: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    productType: { type: String, enum: ["print", "other"], required: true },
    category: { type: String, required: true },
    subcategory: { type: String },
    variants: { type: [String], default: [] },
    delivery: {
      deliveryTypes: [DeliveryTypeSchema], // Use the defined DeliveryTypeSchema
      selfCollectLocation: { type: [String], default: [] },
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      weight: Number,
    },
    // singpostRoyalty: Number, // This should have been removed if it's now nested
    downloads: { type: Number, default: 0 },
    prints: { type: Number, default: 0 },
    numberSold: { type: Number, default: 0 },
    ratings: [
      {
        // Assuming a basic Rating structure, adjust if more complex
        userId: String,
        rating: Number,
        comment: String,
        date: Date,
      },
    ],
    discount: [
      {
        // Assuming a basic Discount structure
        percentage: Number,
        fixedAmount: Number,
        startDate: Date,
        endDate: Date,
      },
    ],
    likes: { type: [String], default: [] }, // Array of user IDs
    views: { type: Number, default: 0 },
    hidden: { type: Boolean, default: false },
    flaggedForModeration: { type: Boolean, default: false },
    slug: { type: String, required: true, unique: true, index: true },
    // Timestamps can be added automatically by Mongoose
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
