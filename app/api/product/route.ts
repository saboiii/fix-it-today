import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product"; // Assuming Product is your Mongoose model
import { uploadFileToS3, deleteFileFromS3 } from "@/utils/s3Helpers";

async function getUniqueSlug(baseSlug: string, id?: string) {
  let uniqueSlug = baseSlug;
  let counter = 2;
  while (true) {
    const existing = await Product.findOne({ slug: uniqueSlug });
    // If no existing product with this slug, or if the existing product is the one we're editing
    if (!existing || (id && existing._id.toString() === id)) break;
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }
  return uniqueSlug;
}

// CREATE a new product
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const formData = await req.formData();

    // Extract fields
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const stock = Number(formData.get("stock") || 0);
    const priceCredits = Number(formData.get("priceCredits") || 0);
    const price = Number(formData.get("price") || 0);
    const creatorUserId = formData.get("creatorUserId") as string;
    const creatorFullName = formData.get("creatorFullName") as string;
    const category = formData.get("category") as string;
    const subcategory = formData.get("subcategory") as string;
    const productType = formData.get("productType") as string;
    const slugBase = formData.get("slug") as string; 
    const uniqueSlug = await getUniqueSlug(slugBase);

    const variants = formData.getAll("variants").map(String);

    // Images
    const imagesRaw = formData.getAll("images");
    const imageLinks: string[] = [];
    for (const file of imagesRaw) {
      if (typeof file === "object" && "arrayBuffer" in file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const url = await uploadFileToS3(buffer, file.name, file.type, "product-images");
        imageLinks.push(url);
      }
    }
    // Models
    const modelsRaw = formData.getAll("models");
    const modelLinks: string[] = [];
    for (const file of modelsRaw) {
      if (typeof file === "object" && "arrayBuffer" in file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const url = await uploadFileToS3(buffer, file.name, file.type, "product-models");
        modelLinks.push(url);
      }
    }
    
    let parsedDeliveryTypes: any[] = []; // Use any for parsing, then cast to your Mongoose schema type
    const deliveryTypesRaw = formData.get("deliveryTypes");
    if (deliveryTypesRaw) {
      try {
        parsedDeliveryTypes = JSON.parse(deliveryTypesRaw.toString());
      } catch (e) { console.error("Failed to parse deliveryTypes:", e); }
    }

    let selfCollectLocation: string[] = formData.getAll("selfCollectLocation[]").map(String);
    const delivery = { deliveryTypes: parsedDeliveryTypes, selfCollectLocation };

    const dimensionsRaw = formData.get("dimensions") as string;
    const dimensions = dimensionsRaw ? JSON.parse(dimensionsRaw) : undefined;

    const productDataToCreate: any = { // Use any or a specific type for creation
      name,
      images: imageLinks,
      description,
      dateReleased: new Date(),
      downloads: 0,
      prints: 0,
      numberSold: 0,
      ratings: [],
      variants,
      stock,
      category,
      subcategory,
      downloadableAssets: modelLinks,
      creatorUserId,
      creatorFullName,
      priceCredits,
      price,
      productType,
      slug: uniqueSlug,
      delivery, // Contains the new deliveryTypes structure
      dimensions,
    };

    const product = await Product.create(productDataToCreate);
    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Error in POST /api/product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

// UPDATE an existing product
export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    const formData = await req.formData();
    const id = formData.get("id") as string;
    if (!id) return NextResponse.json({ error: "Product ID is required for update." }, { status: 400 });
    const oldProduct = await Product.findById(id);
    if (!oldProduct) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    // Extract fields for update
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const stock = Number(formData.get("stock") || 0);
    const priceCredits = Number(formData.get("priceCredits") || 0);
    const priceNum = Number(formData.get("price") || 0); // Renamed to avoid conflict with price in DeliveryType
    const creatorUserId = formData.get("creatorUserId") as string;
    const creatorFullName = formData.get("creatorFullName") as string;
    const category = formData.get("category") as string;
    const subcategory = formData.get("subcategory") as string;
    const productType = formData.get("productType") as string;
    const slugBase = formData.get("slug") as string;
    const uniqueSlug = await getUniqueSlug(slugBase, id);
    const updatedAt = formData.get("updatedAt") as string | undefined;
    const variants = formData.getAll("variants").map(String);

    // Handle Images: new uploads + existing URLs
    const newImageFiles = formData.getAll("images"); // These are new File objects
    const existingImageUrls = formData.getAll("existingImages[]").map(String); // URLs of images to keep

    const finalImageLinks: string[] = [...existingImageUrls];
    for (const file of newImageFiles) {
      if (typeof file === "object" && "arrayBuffer" in file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const url = await uploadFileToS3(buffer, file.name, file.type, "product-images");
        finalImageLinks.push(url);
      }
    }
    // Determine images to delete from S3
    const imagesToDelete = (oldProduct.images || []).filter((oldUrl: string) => !finalImageLinks.includes(oldUrl));
    for (const urlToDelete of imagesToDelete) await deleteFileFromS3(urlToDelete);

    // Handle Models: new uploads + existing URLs
    const newModelFiles = formData.getAll("models"); // These are new File objects
    const existingModelUrls = formData.getAll("existingModels[]").map(String); // URLs of models to keep

    const finalModelLinks: string[] = [...existingModelUrls];
    for (const file of newModelFiles) {
      if (typeof file === "object" && "arrayBuffer" in file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const url = await uploadFileToS3(buffer, file.name, file.type, "product-models");
        finalModelLinks.push(url);
      }
    }
    // Determine models to delete from S3
    const modelsToDelete = (oldProduct.downloadableAssets || []).filter((oldUrl: string) => !finalModelLinks.includes(oldUrl));
    for (const urlToDelete of modelsToDelete) await deleteFileFromS3(urlToDelete);


    let parsedDeliveryTypes: any[] = [];
    const deliveryTypesRaw = formData.get("deliveryTypes");
    if (deliveryTypesRaw) {
      try {
        parsedDeliveryTypes = JSON.parse(deliveryTypesRaw.toString());
      } catch (e) { console.error("Failed to parse deliveryTypes for update:", e); }
    }
    let selfCollectLocation: string[] = formData.getAll("selfCollectLocation[]").map(String);
    const delivery = { deliveryTypes: parsedDeliveryTypes, selfCollectLocation };

    const dimensionsRaw = formData.get("dimensions") as string;
    const dimensions = dimensionsRaw ? JSON.parse(dimensionsRaw) : oldProduct.dimensions;

    const updatedProductData: any = { // Use any or a specific type for update
      name,
      images: finalImageLinks,
      description,
      variants,
      stock,
      category,
      subcategory,
      downloadableAssets: finalModelLinks,
      creatorUserId,
      creatorFullName,
      priceCredits,
      price: priceNum, // Use the renamed variable
      productType,
      slug: uniqueSlug,
      delivery, // Contains the new deliveryTypes structure
      dimensions,
      updatedAt: updatedAt ? new Date(updatedAt) : new Date(),
    };

    const product = await Product.findByIdAndUpdate(id, updatedProductData, { new: true });
    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Error in PUT /api/product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}


// GET /api/product - fetch all products
export async function GET(req: NextRequest) { // Added req: NextRequest for consistency
  try {
    await connectToDatabase();
    const products = await Product.find().sort({ dateReleased: -1 });
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error in GET /api/product:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// DELETE /api/product - delete a product
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    await connectToDatabase();
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Delete all images and models from S3
    const imageUrls: string[] = product.images || [];
    const modelUrls: string[] = product.downloadableAssets || [];
    await Promise.all([
      ...imageUrls.map(deleteFileFromS3),
      ...modelUrls.map(deleteFileFromS3),
    ]);

    // Delete product from DB
    await Product.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}