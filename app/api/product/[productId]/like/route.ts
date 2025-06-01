import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";

export async function POST(req: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const { productId } = params;
    const { userId, action } = await req.json();

    if (!userId || !productId || !["like", "unlike"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    await connectToDatabase();

    let update;
    if (action === "like") {
      update = { $addToSet: { likes: userId } };
    } else {
      update = { $pull: { likes: userId } };
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      update,
      { new: true }
    );

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const likeCount = product.likes ? product.likes.length : 0;
    const liked = product.likes?.includes(userId) ?? false;

    return NextResponse.json({ liked, likeCount });
  } catch (error) {
    console.error("Error in product like route:", error);
    return NextResponse.json({ error: "Failed to process like" }, { status: 500 });
  }
}