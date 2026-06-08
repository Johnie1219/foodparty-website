import { NextResponse } from "next/server";
import { deleteProduct, getProduct } from "@/lib/catalog-store";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const productId = Number(id);
  if (!getProduct(productId)) {
    return NextResponse.json({ error: "존재하지 않는 상품입니다." }, { status: 404 });
  }
  deleteProduct(productId);
  return NextResponse.json({ deleted: productId });
}
