import { describe, expect, it } from "vitest";
import {
  PIXEL_COUNT,
  applyTilesToFrame,
  isValidPixels,
  isValidTilesArray,
} from "./frameSchema.js";

function validPixels(fill = 0) {
  return new Array(PIXEL_COUNT).fill(fill);
}

describe("isValidPixels", () => {
  it("accepts a PIXEL_COUNT-length array of in-range palette indices", () => {
    expect(isValidPixels(validPixels(0))).toBe(true);
    expect(isValidPixels(validPixels(3))).toBe(true);
  });

  it("rejects a non-array", () => {
    expect(isValidPixels("not an array")).toBe(false);
    expect(isValidPixels(null)).toBe(false);
    expect(isValidPixels(undefined)).toBe(false);
  });

  it("rejects an array of the wrong length", () => {
    expect(isValidPixels(validPixels().slice(0, -1))).toBe(false);
    expect(isValidPixels([...validPixels(), 0])).toBe(false);
    expect(isValidPixels([])).toBe(false);
  });

  it("rejects non-integer color indices", () => {
    const pixels = validPixels();
    pixels[0] = 1.5;
    expect(isValidPixels(pixels)).toBe(false);
  });

  it("rejects out-of-range color indices", () => {
    const negative = validPixels();
    negative[0] = -1;
    expect(isValidPixels(negative)).toBe(false);

    // PALETTE_SIZE is 4 (indices 0-3) — 4 itself is out of range.
    const tooHigh = validPixels();
    tooHigh[0] = 4;
    expect(isValidPixels(tooHigh)).toBe(false);
  });
});

describe("isValidTilesArray", () => {
  it("accepts an array of valid pixel arrays", () => {
    const tiles = [validPixels(0), validPixels(1), validPixels(2)];
    expect(isValidTilesArray(tiles)).toBe(true);
  });

  it("accepts an empty array when no tile count is required", () => {
    expect(isValidTilesArray([])).toBe(true);
  });

  it("rejects a non-array", () => {
    expect(isValidTilesArray(null)).toBe(false);
    expect(isValidTilesArray({})).toBe(false);
  });

  it("rejects if any tile's pixels are invalid", () => {
    const tiles = [validPixels(0), [1, 2, 3], validPixels(2)];
    expect(isValidTilesArray(tiles)).toBe(false);
  });

  it("enforces an exact tile count when given", () => {
    const tiles = [validPixels(0), validPixels(1)];
    expect(isValidTilesArray(tiles, 2)).toBe(true);
    expect(isValidTilesArray(tiles, 3)).toBe(false);
  });

  it("skips the tile-count check when expectedTileCount is undefined", () => {
    const tiles = [validPixels(0), validPixels(1), validPixels(2)];
    expect(isValidTilesArray(tiles, undefined)).toBe(true);
  });
});

describe("applyTilesToFrame", () => {
  it("writes each tile's pixels onto the frame's existing Tile instances", () => {
    const tile0Pixels = validPixels(0);
    const frame = {
      tiles: [
        { setPixel: (i, c) => (tile0Pixels[i] = c) },
        { setPixel: () => {} },
      ],
    };

    applyTilesToFrame(frame, [validPixels(3), validPixels(1)]);

    expect(tile0Pixels).toEqual(validPixels(3));
  });

  it("mutates the frame's existing Tile objects rather than replacing frame.tiles", () => {
    const calls = [];
    const frame = {
      tiles: [{ setPixel: (i, c) => calls.push([0, i, c]) }],
    };
    const originalTilesRef = frame.tiles;

    applyTilesToFrame(frame, [[9, 8, 7]]);

    expect(frame.tiles).toBe(originalTilesRef);
    expect(calls).toEqual([
      [0, 0, 9],
      [0, 1, 8],
      [0, 2, 7],
    ]);
  });

  it("only writes as many tiles as the data provides", () => {
    const calls = [];
    const frame = {
      tiles: [
        { setPixel: (i, c) => calls.push(["tile0", i, c]) },
        { setPixel: (i, c) => calls.push(["tile1", i, c]) },
      ],
    };

    applyTilesToFrame(frame, [[5]]);

    expect(calls).toEqual([["tile0", 0, 5]]);
  });
});
