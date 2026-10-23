const fs = require('fs');
const zlib = require('zlib');

const sourcePath = 'C:/Users/SkyFish/.gemini/antigravity-ide/brain/a12c8b3d-a6d3-4c4f-a030-1744ef79f714/.user_uploaded/media_1792753838913.png';
const buf = fs.readFileSync(sourcePath);

// Extract IDAT chunks
let idat = [];
let pos = 8;
while (pos < buf.length) {
  const len = buf.readUInt32BE(pos);
  const type = buf.slice(pos + 4, pos + 8).toString();
  if (type === 'IDAT') idat.push(buf.slice(pos + 8, pos + 8 + len));
  pos += 12 + len;
}

const raw = zlib.inflateSync(Buffer.concat(idat));
const width = 1024;
const height = 236;
const bpp = 4; // RGBA
const stride = 1 + width * bpp;

// Step 1: PNG Un-filtering
const uncompressed = Buffer.alloc(width * height * bpp);

for (let y = 0; y < height; y++) {
  const filterType = raw[y * stride];
  const scanline = raw.slice(y * stride + 1, (y + 1) * stride);
  const prevLine = y > 0 ? uncompressed.slice((y - 1) * width * bpp, y * width * bpp) : null;
  const currentLine = uncompressed.slice(y * width * bpp, (y + 1) * width * bpp);

  for (let x = 0; x < width * bpp; x++) {
    const rawVal = scanline[x];
    const a = x >= bpp ? currentLine[x - bpp] : 0;
    const b = prevLine ? prevLine[x] : 0;
    const c = (prevLine && x >= bpp) ? prevLine[x - bpp] : 0;

    let val = 0;
    if (filterType === 0) val = rawVal;
    else if (filterType === 1) val = (rawVal + a) & 0xFF;
    else if (filterType === 2) val = (rawVal + b) & 0xFF;
    else if (filterType === 3) val = (rawVal + Math.floor((a + b) / 2)) & 0xFF;
    else if (filterType === 4) {
      const p = a + b - c;
      const pa = Math.abs(p - a);
      const pb = Math.abs(p - b);
      const pc = Math.abs(p - c);
      let pr;
      if (pa <= pb && pa <= pc) pr = a;
      else if (pb <= pc) pr = b;
      else pr = c;
      val = (rawVal + pr) & 0xFF;
    }
    currentLine[x] = val;
  }
}

// Step 2: Extract Alpha and Generate Clean Transparent Logos
const scanlinesBurgundy = Buffer.alloc(height * (1 + width * bpp));
const scanlinesWhite = Buffer.alloc(height * (1 + width * bpp));

for (let y = 0; y < height; y++) {
  const rowStart = y * (1 + width * bpp);
  scanlinesBurgundy[rowStart] = 0; // Filter None
  scanlinesWhite[rowStart] = 0;

  for (let x = 0; x < width; x++) {
    const srcIdx = (y * width + x) * bpp;
    const dstIdx = rowStart + 1 + x * bpp;

    const r = uncompressed[srcIdx];
    const g = uncompressed[srcIdx + 1];
    const b = uncompressed[srcIdx + 2];

    // Background is pure white (255, 255, 255)
    // The logo is deep burgundy (R ~ 110, G ~ 30, B ~ 55)
    // Distance from white:
    const diffR = 255 - r;
    const diffG = 255 - g;
    const diffB = 255 - b;
    const maxDiff = Math.max(diffR, diffG, diffB);

    let alpha = 0;
    if (maxDiff <= 10) {
      alpha = 0; // Pure background
    } else if (maxDiff >= 130) {
      alpha = 255; // Solid logo
    } else {
      // Smooth antialiasing curve
      alpha = Math.round(((maxDiff - 10) / 120) * 255);
    }

    // 1. Transparent Burgundy Logo
    if (alpha === 0) {
      scanlinesBurgundy[dstIdx] = 0;
      scanlinesBurgundy[dstIdx + 1] = 0;
      scanlinesBurgundy[dstIdx + 2] = 0;
      scanlinesBurgundy[dstIdx + 3] = 0;
    } else {
      // Use authentic rich burgundy color with proper alpha
      scanlinesBurgundy[dstIdx] = 112; // #701A36
      scanlinesBurgundy[dstIdx + 1] = 26;
      scanlinesBurgundy[dstIdx + 2] = 54;
      scanlinesBurgundy[dstIdx + 3] = alpha;
    }

    // 2. Transparent Pure White Logo (for dark headers/footers)
    if (alpha === 0) {
      scanlinesWhite[dstIdx] = 0;
      scanlinesWhite[dstIdx + 1] = 0;
      scanlinesWhite[dstIdx + 2] = 0;
      scanlinesWhite[dstIdx + 3] = 0;
    } else {
      scanlinesWhite[dstIdx] = 255;
      scanlinesWhite[dstIdx + 1] = 255;
      scanlinesWhite[dstIdx + 2] = 255;
      scanlinesWhite[dstIdx + 3] = alpha;
    }
  }
}

// PNG Encoder
function encodePNG(scanlines, w, h) {
  const compressed = zlib.deflateSync(scanlines, { level: 9 });
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(w, 0);
  ihdrData.writeUInt32BE(h, 4);
  ihdrData[8] = 8; // Bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // Deflate
  ihdrData[11] = 0; // Filter None
  ihdrData[12] = 0; // Non-interlaced
  const ihdr = makeChunk('IHDR', ihdrData);

  const idatChunk = makeChunk('IDAT', compressed);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idatChunk, iend]);
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(chunk.slice(4, 8 + len));
  chunk.writeInt32BE(crc, 8 + len);
  return chunk;
}

const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return crc ^ (-1);
}

const pngBurgundy = encodePNG(scanlinesBurgundy, width, height);
fs.writeFileSync('public/images/brand/logo.png', pngBurgundy);
fs.writeFileSync('public/images/brand/logo-transparent.png', pngBurgundy);

const pngWhite = encodePNG(scanlinesWhite, width, height);
fs.writeFileSync('public/images/brand/logo-white.png', pngWhite);

// Also generate SVG wrappers so any consumer receives the official logo
const bBurgundy = pngBurgundy.toString('base64');
const bWhite = pngWhite.toString('base64');

const svgBurgundy = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
  <image href="data:image/png;base64,${bBurgundy}" width="${width}" height="${height}" />
</svg>
`;
fs.writeFileSync('public/images/brand/logo.svg', svgBurgundy);

const svgWhite = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
  <image href="data:image/png;base64,${bWhite}" width="${width}" height="${height}" />
</svg>
`;
fs.writeFileSync('public/images/brand/logo-white.svg', svgWhite);

console.log('Successfully generated flawless transparent PNG and SVG logos:');
console.log('  -> public/images/brand/logo.png (' + pngBurgundy.length + ' bytes)');
console.log('  -> public/images/brand/logo-white.png (' + pngWhite.length + ' bytes)');
console.log('  -> public/images/brand/logo.svg and logo-white.svg');

