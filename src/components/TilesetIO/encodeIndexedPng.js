// Minimal indexed-color (8-bit colormap, ≤4-color/2bpp) PNG encoder.
//
// No canvas API can produce this: canvas.toBlob()/toDataURL() only ever
// write RGB(A) PNGs, but GBDK tooling (png2asset) expects an indexed PNG
// with a small palette. Writing the handful of PNG/zlib bytes ourselves
// avoids pulling in a runtime PNG library for what's a well-specified,
// tiny format — deflate "stored" (uncompressed) blocks are valid per the
// zlib/deflate spec, so no compressor is needed either.

const PNG_SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

function makeCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
}
const CRC_TABLE = makeCrcTable();

function crc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function adler32(bytes) {
  const MOD_ADLER = 65521;
  let a = 1;
  let b = 0;
  for (let i = 0; i < bytes.length; i++) {
    a = (a + bytes[i]) % MOD_ADLER;
    b = (b + a) % MOD_ADLER;
  }
  return ((b << 16) | a) >>> 0;
}

function writeUint32BE(target, offset, value) {
  target[offset] = (value >>> 24) & 0xff;
  target[offset + 1] = (value >>> 16) & 0xff;
  target[offset + 2] = (value >>> 8) & 0xff;
  target[offset + 3] = value & 0xff;
}

function concatBytes(arrays) {
  const total = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const arr of arrays) {
    out.set(arr, offset);
    offset += arr.length;
  }
  return out;
}

function makeChunk(type, data) {
  const typeBytes = new TextEncoder().encode(type);
  const chunk = new Uint8Array(4 + typeBytes.length + data.length + 4);
  writeUint32BE(chunk, 0, data.length);
  chunk.set(typeBytes, 4);
  chunk.set(data, 4 + typeBytes.length);
  writeUint32BE(
    chunk,
    4 + typeBytes.length + data.length,
    crc32(chunk.subarray(4, 4 + typeBytes.length + data.length)),
  );
  return chunk;
}

// Wraps raw bytes as a zlib stream using only uncompressed ("stored")
// deflate blocks, each capped at the format's 65535-byte limit.
function zlibStore(data) {
  const MAX_STORED_BLOCK = 65535;
  const blocks = [];
  let offset = 0;
  do {
    const blockLength = Math.min(MAX_STORED_BLOCK, data.length - offset);
    const isFinalBlock = offset + blockLength >= data.length;
    const header = new Uint8Array(5);
    header[0] = isFinalBlock ? 1 : 0; // BFINAL + BTYPE=00 (stored)
    header[1] = blockLength & 0xff;
    header[2] = (blockLength >> 8) & 0xff;
    const lengthComplement = ~blockLength & 0xffff;
    header[3] = lengthComplement & 0xff;
    header[4] = (lengthComplement >> 8) & 0xff;
    blocks.push(header, data.subarray(offset, offset + blockLength));
    offset += blockLength;
  } while (offset < data.length);

  const deflateStream = concatBytes(blocks);
  const zlibStream = new Uint8Array(2 + deflateStream.length + 4);
  zlibStream[0] = 0x78; // CMF: deflate, 32K window
  zlibStream[1] = 0x01; // FLG: fastest, checksum-valid with CMF above
  zlibStream.set(deflateStream, 2);
  writeUint32BE(zlibStream, 2 + deflateStream.length, adler32(data));
  return zlibStream;
}

// pixels: flat, row-major array of palette indices, one per pixel.
// paletteColors: array of [r, g, b] byte triples, index == palette index.
export function encodeIndexedPng({ width, height, pixels, paletteColors }) {
  const bitDepth = 2; // enough for ≤4 palette colors
  const rowBytes = Math.ceil((width * bitDepth) / 8);
  const rawRows = new Uint8Array(height * (1 + rowBytes));

  let rowStart = 0;
  for (let y = 0; y < height; y++) {
    rawRows[rowStart] = 0; // filter type: none
    for (let x = 0; x < width; x++) {
      const colorIndex = pixels[y * width + x] & 0b11;
      const byteOffset = rowStart + 1 + (x >> 2);
      const shift = 6 - (x % 4) * 2;
      rawRows[byteOffset] |= colorIndex << shift;
    }
    rowStart += 1 + rowBytes;
  }

  const ihdr = new Uint8Array(13);
  writeUint32BE(ihdr, 0, width);
  writeUint32BE(ihdr, 4, height);
  ihdr[8] = bitDepth;
  ihdr[9] = 3; // color type 3: indexed
  ihdr[10] = 0; // compression method
  ihdr[11] = 0; // filter method
  ihdr[12] = 0; // interlace method

  const plte = new Uint8Array(paletteColors.length * 3);
  paletteColors.forEach(([r, g, b], i) => {
    plte[i * 3] = r;
    plte[i * 3 + 1] = g;
    plte[i * 3 + 2] = b;
  });

  const idat = zlibStore(rawRows);

  return concatBytes([
    PNG_SIGNATURE,
    makeChunk("IHDR", ihdr),
    makeChunk("PLTE", plte),
    makeChunk("IDAT", idat),
    makeChunk("IEND", new Uint8Array(0)),
  ]);
}
