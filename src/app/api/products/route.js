import { NextResponse } from 'next/server';
import { getProductsList, createProduct } from '../../../lib/server/products.js';
import { getCurrentStaffSession } from '../../../lib/server/auth.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const lifecycle = searchParams.get('lifecycle') || undefined;
    const publishState = searchParams.get('publishState') || undefined;

    const products = getProductsList({ category, search, lifecycle, publishState });
    return NextResponse.json({ success: true, products, count: products.length });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentStaffSession();
    const body = await request.json();

    const result = await createProduct(body, user?.id || 'staff_admin');
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
