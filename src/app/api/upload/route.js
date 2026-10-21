import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'prodcuts');
    if (!fs.existsSync(uploadDir)) {
      return NextResponse.json({ success: true, images: [] });
    }
    const files = fs.readdirSync(uploadDir).filter((f) => /\.(png|jpe?g|webp|svg)$/i.test(f));
    const images = files.map((f) => ({
      name: f,
      url: `/images/prodcuts/${f}`
    }));
    return NextResponse.json({ success: true, images });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ success: false, error: 'No valid file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename
    const ext = path.extname(file.name) || '.png';
    const base = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `${base}_${Date.now()}${ext}`;

    const uploadDir = path.join(process.cwd(), 'public', 'images', 'prodcuts');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/images/prodcuts/${fileName}`;
    return NextResponse.json({ success: true, url: publicUrl, fileName }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
