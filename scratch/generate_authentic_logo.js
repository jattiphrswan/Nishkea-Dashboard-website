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
const bpp = 4;
const stride = 1 + width * bpp;

// PNG Scanline Un-filtering (Reverse UP/SUB/AVG/PAETH filters)
const img = Buffer.alloc(width * height * bpp);
for (let y = 0; y < height; y++) {
  const filterType = raw[y * stride];
  const scanline = raw.slice(y * stride + 1, (y + 1) * stride);
  const prevLine = y > 0 ? img.slice((y - 1) * width * bpp, y * width * bpp) : null;
  const currentLine = img.slice(y * width * bpp, (y + 1) * width * bpp);

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

// Brand Colors
const BURGUNDY_R = 120; // #781D39 authentic brand color
const BURGUNDY_G = 29;
const BURGUNDY_B = 57;

// Circle geometry
const circleCenterX = 101.5;
const circleCenterY = 101.5;
const circleRadius = 95.5;

// Buffers for 2 versions:
// 1. Authentic Brand Colors (Burgundy circle with solid white ribbon + Burgundy letters)
const scanlinesAuthentic = Buffer.alloc(height * (1 + width * bpp));
// 2. High-Contrast Dark-Surface Variant (Burgundy circle with white ribbon + Crisp Pure White letters)
const scanlinesDarkSurface = Buffer.alloc(height * (1 + width * bpp));

for (let y = 0; y < height; y++) {
  const rowStart = y * (1 + width * bpp);
  scanlinesAuthentic[rowStart] = 0;
  scanlinesDarkSurface[rowStart] = 0;

  for (let x = 0; x < width; x++) {
    const srcIdx = (y * width + x) * bpp;
    const dstIdx = rowStart + 1 + x * bpp;

    const r = img[srcIdx];
    const g = img[srcIdx + 1];
    const b = img[srcIdx + 2];
    const brightness = (r + g + b) / 3;

    // Check if pixel is within or near the circular emblem (x <= 205)
    if (x <= 205) {
      const dist = Math.hypot(x - circleCenterX, y - circleCenterY);

      if (dist <= circleRadius - 1.5) {
        // INSIDE THE CIRCLE
        // Check if part of the white ribbon or the burgundy circle
        if (r > 195 && g > 195 && b > 195) {
          // SOLID OPAQUE WHITE RIBBON MOTIF
          scanlinesAuthentic[dstIdx] = 255;
          scanlinesAuthentic[dstIdx + 1] = 255;
          scanlinesAuthentic[dstIdx + 2] = 255;
          scanlinesAuthentic[dstIdx + 3] = 255;

          scanlinesDarkSurface[dstIdx] = 255;
          scanlinesDarkSurface[dstIdx + 1] = 255;
          scanlinesDarkSurface[dstIdx + 2] = 255;
          scanlinesDarkSurface[dstIdx + 3] = 255;
        } else if (r < 155 && g < 75 && b < 95) {
          // SOLID AUTHENTIC BURGUNDY CIRCLE
          scanlinesAuthentic[dstIdx] = BURGUNDY_R;
          scanlinesAuthentic[dstIdx + 1] = BURGUNDY_G;
          scanlinesAuthentic[dstIdx + 2] = BURGUNDY_B;
          scanlinesAuthentic[dstIdx + 3] = 255;

          scanlinesDarkSurface[dstIdx] = BURGUNDY_R;
          scanlinesDarkSurface[dstIdx + 1] = BURGUNDY_G;
          scanlinesDarkSurface[dstIdx + 2] = BURGUNDY_B;
          scanlinesDarkSurface[dstIdx + 3] = 255;
        } else {
          // Anti-aliased transition between white ribbon and burgundy background
          // Interpolate between Burgundy and White with full opacity (255)
          const ribbonWeight = Math.max(0, Math.min(1, (brightness - 80) / 130));
          const blendR = Math.round(BURGUNDY_R + (255 - BURGUNDY_R) * ribbonWeight);
          const blendG = Math.round(BURGUNDY_G + (255 - BURGUNDY_G) * ribbonWeight);
          const blendB = Math.round(BURGUNDY_B + (255 - BURGUNDY_B) * ribbonWeight);

          scanlinesAuthentic[dstIdx] = blendR;
          scanlinesAuthentic[dstIdx + 1] = blendG;
          scanlinesAuthentic[dstIdx + 2] = blendB;
          scanlinesAuthentic[dstIdx + 3] = 255;

          scanlinesDarkSurface[dstIdx] = blendR;
          scanlinesDarkSurface[dstIdx + 1] = blendG;
          scanlinesDarkSurface[dstIdx + 2] = blendB;
          scanlinesDarkSurface[dstIdx + 3] = 255;
        }
      } else if (dist <= circleRadius + 1.5) {
        // SMOOTH ANTI-ALIASED OUTER PERIMETER OF CIRCLE
        const outerAlpha = Math.round(Math.max(0, Math.min(1, (circleRadius + 1.5 - dist) / 3)) * 255);
        scanlinesAuthentic[dstIdx] = BURGUNDY_R;
        scanlinesAuthentic[dstIdx + 1] = BURGUNDY_G;
        scanlinesAuthentic[dstIdx + 2] = BURGUNDY_B;
        scanlinesAuthentic[dstIdx + 3] = outerAlpha;

        scanlinesDarkSurface[dstIdx] = BURGUNDY_R;
        scanlinesDarkSurface[dstIdx + 1] = BURGUNDY_G;
        scanlinesDarkSurface[dstIdx + 2] = BURGUNDY_B;
        scanlinesDarkSurface[dstIdx + 3] = outerAlpha;
      } else {
        // Outside the circle
        scanlinesAuthentic[dstIdx] = 0;
        scanlinesAuthentic[dstIdx + 1] = 0;
        scanlinesAuthentic[dstIdx + 2] = 0;
        scanlinesAuthentic[dstIdx + 3] = 0;

        scanlinesDarkSurface[dstIdx] = 0;
        scanlinesDarkSurface[dstIdx + 1] = 0;
        scanlinesDarkSurface[dstIdx + 2] = 0;
        scanlinesDarkSurface[dstIdx + 3] = 0;
      }
    } else {
      // WORDMARK REGION (NIS HKÈA + IT SUITS YOU !)
      const diff = 255 - brightness;

      // Special handling for thin tagline at bottom
      const isTagline = y >= 190 && x >= 370 && x <= 670;
      const threshold = isTagline ? 18 : 12;
      const solidThreshold = isTagline ? 65 : 100;

      let alpha = 0;
      if (diff <= threshold) {
        alpha = 0;
      } else if (diff >= solidThreshold) {
        alpha = 255;
      } else {
        alpha = Math.round(((diff - threshold) / (solidThreshold - threshold)) * 255);
      }

      // 1. Authentic Burgundy Wordmark
      if (alpha === 0) {
        scanlinesAuthentic[dstIdx] = 0;
        scanlinesAuthentic[dstIdx + 1] = 0;
        scanlinesAuthentic[dstIdx + 2] = 0;
        scanlinesAuthentic[dstIdx + 3] = 0;
      } else {
        scanlinesAuthentic[dstIdx] = BURGUNDY_R;
        scanlinesAuthentic[dstIdx + 1] = BURGUNDY_G;
        scanlinesAuthentic[dstIdx + 2] = BURGUNDY_B;
        scanlinesAuthentic[dstIdx + 3] = alpha;
      }

      // 2. Crisp Pure White Wordmark (for dark background option)
      if (alpha === 0) {
        scanlinesDarkSurface[dstIdx] = 0;
        scanlinesDarkSurface[dstIdx + 1] = 0;
        scanlinesDarkSurface[dstIdx + 2] = 0;
        scanlinesDarkSurface[dstIdx + 3] = 0;
      } else {
        scanlinesDarkSurface[dstIdx] = 255;
        scanlinesDarkSurface[dstIdx + 1] = 255;
        scanlinesDarkSurface[dstIdx + 2] = 255;
        scanlinesDarkSurface[dstIdx + 3] = alpha;
      }
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
  ihdrData[8] = 8;
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
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

// Write files
const pngAuthentic = encodePNG(scanlinesAuthentic, width, height);
fs.writeFileSync('public/images/brand/logo.png', pngAuthentic);
fs.writeFileSync('public/images/brand/logo-transparent.png', pngAuthentic);

const pngDarkSurface = encodePNG(scanlinesDarkSurface, width, height);
fs.writeFileSync('public/images/brand/logo-dark-bg.png', pngDarkSurface);
fs.writeFileSync('public/images/brand/logo-white.png', pngDarkSurface);

// Also create SVG wrappers
const bAuthentic = pngAuthentic.toString('base64');
const bDarkSurface = pngDarkSurface.toString('base64');

const svgAuthentic = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
  <image href="data:image/png;base64,${bAuthentic}" width="${width}" height="${height}" />
</svg>
`;
fs.writeFileSync('public/images/brand/logo.svg', svgAuthentic);

const svgWhite = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
  <image href="data:image/png;base64,${bDarkSurface}" width="${width}" height="${height}" />
</svg>
`;
fs.writeFileSync('public/images/brand/logo-white.svg', svgWhite);

console.log('Successfully generated authentic NISHKÈA brand logos:');
console.log('  1. public/images/brand/logo.png (Authentic Burgundy Circle + Solid White Ribbon + Burgundy Typography)');
console.log('  2. public/images/brand/logo-dark-bg.png (Burgundy Circle + Solid White Ribbon + Crisp White Typography)');
console.log('  3. SVGs updated.');
