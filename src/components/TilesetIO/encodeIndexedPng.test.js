import { inflateSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { encodeIndexedPng } from "./encodeIndexedPng.js";

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

// Generic PNG chunk reader: [8-byte signature][length(4) type(4) data(n) crc(4)]*
// CRC-32 correctness isn't reverified here — that would just re-implement
// encodeIndexedPng's own crc32() a second time. Structural correctness (right
// fields, right byte order) plus letting Node's zlib actually decompress the
// IDAT payload (which validates the deflate "stored" blocks and the Adler-32
// checksum) gives strong, independent coverage without duplicating the source.
function parsePngChunks(bytes) {
  expect(Array.from(bytes.subarray(0, 8))).toEqual(PNG_SIGNATURE);

  const chunks = [];
  let offset = 8;
  while (offset < bytes.length) {
    const view = new DataView(
      bytes.buffer,
      bytes.byteOffset + offset,
      bytes.length - offset,
    );
    const length = view.getUint32(0);
    const type = new TextDecoder().decode(
      bytes.subarray(offset + 4, offset + 8),
    );
    const data = bytes.subarray(offset + 8, offset + 8 + length);
    chunks.push({ type, data });
    offset += 12 + length; // length + type + data + crc
  }
  return chunks;
}

describe("encodeIndexedPng", () => {
  it("emits the PNG signature and chunks in IHDR/PLTE/IDAT/IEND order", () => {
    const bytes = encodeIndexedPng({
      width: 1,
      height: 1,
      pixels: new Uint8Array([0]),
      paletteColors: [[0, 0, 0]],
    });
    const chunks = parsePngChunks(bytes);
    expect(chunks.map((c) => c.type)).toEqual(["IHDR", "PLTE", "IDAT", "IEND"]);
  });

  it("writes width/height/bit-depth/color-type correctly in IHDR", () => {
    const bytes = encodeIndexedPng({
      width: 5,
      height: 3,
      pixels: new Uint8Array(15),
      paletteColors: [[0, 0, 0]],
    });
    const [ihdr] = parsePngChunks(bytes);
    const view = new DataView(ihdr.data.buffer, ihdr.data.byteOffset);
    expect(view.getUint32(0)).toBe(5); // width
    expect(view.getUint32(4)).toBe(3); // height
    expect(ihdr.data[8]).toBe(2); // bit depth: 2 bits/pixel (<=4 colors)
    expect(ihdr.data[9]).toBe(3); // color type: 3 = indexed
    expect(ihdr.data[10]).toBe(0); // compression method
    expect(ihdr.data[11]).toBe(0); // filter method
    expect(ihdr.data[12]).toBe(0); // interlace method
  });

  it("writes the palette as flat RGB triples in PLTE", () => {
    const paletteColors = [
      [0, 0, 0],
      [85, 85, 85],
      [170, 170, 170],
      [255, 255, 255],
    ];
    const bytes = encodeIndexedPng({
      width: 1,
      height: 1,
      pixels: new Uint8Array([0]),
      paletteColors,
    });
    const [, plte] = parsePngChunks(bytes);
    expect(Array.from(plte.data)).toEqual(paletteColors.flat());
  });

  it("bit-packs 4 pixels per byte, MSB-first, with a leading filter-type byte per row", () => {
    // 2x2 image, one distinct color index per pixel (0,1,2,3), row-major.
    const bytes = encodeIndexedPng({
      width: 2,
      height: 2,
      pixels: new Uint8Array([0, 1, 2, 3]),
      paletteColors: [
        [0, 0, 0],
        [1, 1, 1],
        [2, 2, 2],
        [3, 3, 3],
      ],
    });
    const [, , idat] = parsePngChunks(bytes);
    const raw = inflateSync(idat.data);

    // row 0: filter=0, then colors 0,1 packed into the top two 2-bit slots
    // (0b00_01_0000 = 0x10); row 1: filter=0, colors 2,3 (0b10_11_0000 = 0xB0)
    expect(Array.from(raw)).toEqual([0, 0b00010000, 0, 0b10110000]);
  });

  it("packs a row wider than 4 pixels across multiple bytes, MSB-first", () => {
    // width 5 needs ceil(5*2/8) = 2 packed bytes per row; the 5th pixel
    // starts a new byte at its most significant 2 bits.
    const bytes = encodeIndexedPng({
      width: 5,
      height: 1,
      pixels: new Uint8Array([1, 2, 3, 0, 2]),
      paletteColors: [
        [0, 0, 0],
        [1, 1, 1],
        [2, 2, 2],
        [3, 3, 3],
      ],
    });
    const [, , idat] = parsePngChunks(bytes);
    const raw = inflateSync(idat.data);

    expect(Array.from(raw)).toEqual([
      0, // filter type
      0b01_10_11_00, // colors 1,2,3,0
      0b10_000000, // color 2, remaining bits unused
    ]);
  });
});
