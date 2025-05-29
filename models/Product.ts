import { Schema, model, models } from "mongoose";

const RatingSchema = new Schema({
  title: { type: String, maxlength: 200 }, // 20 words max (approx 200 chars)
  description: { type: String, maxlength: 1000 }, // 200 words max (approx 1000 chars)
  images: [{ type: String }], // S3 links
  rating: { type: Number, min: 0, max: 5 },
});

const ProductSchema = new Schema({
  name: { type: String, required: true },
  images: [{ type: String, required: true }], // S3 links
  description: { type: String, required: true, maxlength: 1000 }, // 100 words max (approx 1000 chars)
  dateReleased: { type: Date, required: true },
  downloads: { type: Number, min: 0, default: 0 }, // Only for 3D Models
  prints: { type: Number, min: 0, default: 0 }, // Only for 3D Models
  numberSold: { type: Number, min: 0, default: 0 },
  ratings: [RatingSchema],
  variants: [{ type: String }],
  stock: { type: Number, min: 0, default: 0 },
  category: { type: String, required: true },
  subcategory: { type: String },
  downloadableAssets: [{ type: String }], // S3 links
  creatorUserId: { type: String, required: true },
  creatorFullName: { type: String, required: true },
  priceCredits: { type: Number, min: 0, required: true },
  price: { type: Number, min: 0, required: true },
});

export default models.Product || model("Product", ProductSchema);