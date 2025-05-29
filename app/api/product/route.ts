import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/lib/s3";
import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";
import { v4 as uuidv4 } from "uuid";

// Helper to upload a file buffer to S3
async function uploadFileToS3(buffer: Buffer, filename: string, mimetype: string, folder: string) {
  const ext = filename.split(".").pop();
  const key = `${folder}/${uuidv4()}.${ext}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    })
  );
  return `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;
}

// Helper to delete a file from S3 by URL
async function deleteFileFromS3(url: string) {
  try {
    const bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME!;
    const key = url.split(`.amazonaws.com/`)[1];
    if (!key) return;
    await s3.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
  } catch (err) {
    console.error("Failed to delete from S3:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse multipart form data using the Web API
    const formData = await req.formData();

    // Extract fields
    const id = formData.get("id") as string | undefined; // For editing
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

    // Variants (can be multiple)
    let variants: string[] = [];
    const variantsRaw = formData.getAll("variants");
    if (variantsRaw && variantsRaw.length > 0) {
      variants = variantsRaw.map((v) => v.toString());
    }

    // Images (can be multiple)
    const imagesRaw = formData.getAll("images");
    const imageLinks: string[] = [];
    for (const file of imagesRaw) {
      if (typeof file === "object" && "arrayBuffer" in file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const url = await uploadFileToS3(buffer, file.name, file.type, "product-images");
        imageLinks.push(url);
      } else if (typeof file === "string") {
        // Existing image URL
        imageLinks.push(file);
      }
    }

    // Models (can be multiple)
    const modelsRaw = formData.getAll("models");
    const modelLinks: string[] = [];
    for (const file of modelsRaw) {
      if (typeof file === "object" && "arrayBuffer" in file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const url = await uploadFileToS3(buffer, file.name, file.type, "product-models");
        modelLinks.push(url);
      } else if (typeof file === "string") {
        // Existing model URL
        modelLinks.push(file);
      }
    }

    await connectToDatabase();

    let product;
    if (id) {
      // Editing existing product
      const oldProduct = await Product.findById(id);
      if (!oldProduct) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }

      // Find unused images and models to delete
      const unusedImages = (oldProduct.images || []).filter(
        (url: string) => !imageLinks.includes(url)
      );
      const unusedModels = (oldProduct.downloadableAssets || []).filter(
        (url: string) => !modelLinks.includes(url)
      );

      // Delete unused files from S3
      await Promise.all([
        ...unusedImages.map(deleteFileFromS3),
        ...unusedModels.map(deleteFileFromS3),
      ]);

      // Update product
      product = await Product.findByIdAndUpdate(
        id,
        {
          name,
          images: imageLinks,
          description,
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
        },
        { new: true }
      );
    } else {
      // Create new product
      product = await Product.create({
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
      });
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Error in /api/product:", error);
    return NextResponse.json({ error: "Failed to create or update product" }, { status: 500 });
  }
}

// GET /api/product - fetch all products
export async function GET() {
  try {
    await connectToDatabase();
    const products = await Product.find().sort({ dateReleased: -1 });
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error in GET /api/product:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}