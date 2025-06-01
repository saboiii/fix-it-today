import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";

export async function GET(
  req: NextRequest,
  context: { params: { slug: string } } 
) {
  const awaitedParams = await context.params;
  await connectToDatabase();
  const product = await Product.findOne({ slug: awaitedParams.slug });

  if (!product) {
    return NextResponse.json({ product: null }, { status: 404 });
  }
  return NextResponse.json({ product });
}
