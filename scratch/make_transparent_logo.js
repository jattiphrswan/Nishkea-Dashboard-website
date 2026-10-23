const fs = require('fs');
const zlib = require('zlib');

// Read logo.png
const buf = fs.readFileSync('public/images/brand/logo.png');
const width = buf.readUInt32BE(16);
const height = buf.readUInt32BE(20);

let idat = [];
let pos = 8;
while (pos < buf.length) {
  const len = buf.readUInt32BE(pos);
  const type = buf.slice(pos + 4, pos + 8).toString();
  if (type === 'IDAT') idat.push(buf.slice(pos + 8, pos + 8 + len));
  pos += 12 + len;
}

const raw = zlib.inflateSync(Buffer.concat(idat));
const bytesPerPixel = 4;
const stride = 1 + width * bytesPerPixel; // 1 filter byte per scanline

// We create two versions:
// 1. Transparent Burgundy logo (for light backgrounds)
// 2. Transparent White logo (for dark backgrounds)
const rawTransBurgundy = Buffer.alloc(raw.length);
const rawTransWhite = Buffer.alloc(raw.length);

for (let y = 0; y < height; y++) {
  const rowStart = y * stride;
  rawTransBurgundy[rowStart] = 0; // Filter None
  rawTransWhite[rowStart] = 0;

  for (let x = 0; x < width; x++) {
    const srcIdx = rowStart + 1 + x * bytesPerPixel;
    const r = raw[srcIdx];
    const g = raw[srcIdx + 1];
    const b = raw[srcIdx + 2];
    const a = raw[srcIdx + 3];

    // Compute distance from pure white (255,255,255)
    // Burgundy is approx #781D39 (r=120, g=29, b=57)
    const brightness = (r + g + b) / 3;
    let alpha;
    if (brightness >= 250) {
      alpha = 0; // Transparent
    } else if (brightness >= 235) {
      // Smooth anti-aliased edge
      alpha = Math.round((250 - brightness) / 15 * 255);
    } else {
      alpha = 255;
    }

    // Version 1: Burgundy on transparent
    rawTransBurgundy[srcIdx] = r;
    rawTransBurgundy[srcIdx + 1] = g;
    rawTransBurgundy[srcIdx + 2] = b;
    rawTransBurgundy[srcIdx + 3] = alpha;

    // Version 2: Pure White on transparent (for dark backgrounds)
    rawTransWhite[srcIdx] = 255;
    rawTransWhite[srcIdx + 1] = 255;
    rawTransWhite[srcIdx + 2] = 255;
    rawTransWhite[srcIdx + 3] = alpha;
  }
}

// Function to encode uncompressed scanlines back to standard PNG
function encodePNG(scanlines, w, h) {
  const compressed = zlib.deflateSync(scanlines, { level: 9 });
  
  // Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(w, 0);
  ihdrData.writeUInt32BE(h, 4);
  ihdrData[8] = 8; // Bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace
  const ihdr = makeChunk('IHDR', ihdrData);
  
  // IDAT
  const idatChunk = makeChunk('IDAT', compressed);
  
  // IEND
  const iend = makeChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdr, idatChunk, iend]);
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  
  // CRC32
  const crc = crc32(chunk.slice(4, 8 + len));
  chunk.writeInt32BE(crc, 8 + len);
  return chunk;
}

// Simple CRC32 table
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

const pngBurgundy = encodePNG(rawTransBurgundy, width, height);
fs.writeFileSync('public/images/brand/logo.png', pngBurgundy);
fs.writeFileSync('public/images/brand/logo-transparent.png', pngBurgundy);

const pngWhite = encodePNG(rawTransWhite, width, height);
fs.writeFileSync('public/images/brand/logo-white.png', pngWhite);

console.log('Successfully generated transparent PNG logos:');
console.log(' - public/images/brand/logo.png (Transparent Burgundy Logo)');
console.log(' - public/images/brand/logo-white.png (Transparent White Logo)');
