import { NextResponse } from 'next/server';
import { getProductById, updateProduct } from '../../../../lib/server/products.js';
import { getCurrentStaffSession } from '../../../../lib/server/auth.js';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const product = getProductById(id);

    if (!product) {
      return NextResponse.json({ success: false, error: `Product '${id}' not found` }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await getCurrentStaffSession();
    const { id } = await params;
    const body = await request.json();

    const result = await updateProduct(id, body, user?.id || 'staff_admin');
    return NextResponse.json(result);
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : 400;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}
