import { describe, expect, it } from "vitest";
import {
  buildFramesPixelGrid,
  buildSpritePixelGrid,
  hexToRgb,
} from "./generateSpritePng.js";

const TILE_SIZE = 8;

function solidTile(colorIndex) {
  return { pixels: new Array(TILE_SIZE * TILE_SIZE).fill(colorIndex) };
}

describe("buildSpritePixelGrid", () => {
  it("returns a single tile's own pixels unchanged for a 1-tile, mapWidth-1 grid", () => {
    const tile = solidTile(2);
    const { width, height, pixels } = buildSpritePixelGrid([tile], 1);

    expect(width).toBe(TILE_SIZE);
    expect(height).toBe(TILE_SIZE);
    expect(Array.from(pixels)).toEqual(tile.pixels);
  });

  it("lays tiles out left-to-right for a single row", () => {
    const { width, height, pixels } = buildSpritePixelGrid(
      [solidTile(1), solidTile(2)],
      2,
    );

    expect(width).toBe(TILE_SIZE * 2);
    expect(height).toBe(TILE_SIZE);
    for (let y = 0; y < TILE_SIZE; y++) {
      for (let x = 0; x < TILE_SIZE; x++) {
        expect(pixels[y * width + x]).toBe(1); // left tile
        expect(pixels[y * width + TILE_SIZE + x]).toBe(2); // right tile
      }
    }
  });

  it("wraps to a new row once mapWidth tiles fill the current row", () => {
    const { width, height, pixels } = buildSpritePixelGrid(
      [solidTile(1), solidTile(2)],
      1,
    );

    expect(width).toBe(TILE_SIZE);
    expect(height).toBe(TILE_SIZE * 2);
    for (let y = 0; y < TILE_SIZE; y++) {
      for (let x = 0; x < TILE_SIZE; x++) {
        expect(pixels[y * width + x]).toBe(1); // top tile
        expect(pixels[(TILE_SIZE + y) * width + x]).toBe(2); // bottom tile
      }
    }
  });

  it("preserves each tile's internal pixel layout (row-major within the tile)", () => {
    const pixels = new Array(TILE_SIZE * TILE_SIZE).fill(0);
    pixels[2 * TILE_SIZE + 3] = 9; // row 2, col 3 within the tile
    const { width, pixels: grid } = buildSpritePixelGrid([{ pixels }], 1);

    expect(grid[2 * width + 3]).toBe(9);
    // everywhere else stays 0
    expect(grid.filter((value) => value === 9)).toHaveLength(1);
  });
});

describe("buildFramesPixelGrid", () => {
  it("returns one frame's own grid unchanged for a single frame", () => {
    const framesTiles = [[solidTile(2)]];
    const { width, height, pixels } = buildFramesPixelGrid(framesTiles, 1);

    expect(width).toBe(TILE_SIZE);
    expect(height).toBe(TILE_SIZE);
    expect(Array.from(pixels)).toEqual(solidTile(2).pixels);
  });

  it("lays same-height frames out left-to-right, widths summed", () => {
    const framesTiles = [[solidTile(1)], [solidTile(2)]];
    const { width, height, pixels } = buildFramesPixelGrid(framesTiles, 1);

    expect(width).toBe(TILE_SIZE * 2);
    expect(height).toBe(TILE_SIZE);
    for (let y = 0; y < TILE_SIZE; y++) {
      for (let x = 0; x < TILE_SIZE; x++) {
        expect(pixels[y * width + x]).toBe(1); // left frame
        expect(pixels[y * width + TILE_SIZE + x]).toBe(2); // right frame
      }
    }
  });

  it("uses the tallest frame's height, padding shorter frames with 0", () => {
    // 1 tile wide, 1 row (mapWidth 1) vs. 1 tile wide, 2 rows.
    const shortFrame = [solidTile(1)];
    const tallFrame = [solidTile(2), solidTile(3)];
    const { width, height, pixels } = buildFramesPixelGrid(
      [shortFrame, tallFrame],
      1,
    );

    expect(width).toBe(TILE_SIZE * 2);
    expect(height).toBe(TILE_SIZE * 2);
    // Short frame's second row (past its own height) stays 0.
    for (let x = 0; x < TILE_SIZE; x++) {
      expect(pixels[TILE_SIZE * width + x]).toBe(0);
    }
    // Tall frame's second row is still tile color 3.
    for (let x = 0; x < TILE_SIZE; x++) {
      expect(pixels[TILE_SIZE * width + TILE_SIZE + x]).toBe(3);
    }
  });

  it("returns a zero-size grid for no frames", () => {
    const { width, height, pixels } = buildFramesPixelGrid([], 2);
    expect(width).toBe(0);
    expect(height).toBe(0);
    expect(pixels).toHaveLength(0);
  });
});

describe("hexToRgb", () => {
  it("parses a 6-digit hex color with a leading #", () => {
    expect(hexToRgb("#ff8800")).toEqual([255, 136, 0]);
  });

  it("parses a 6-digit hex color without a leading #", () => {
    expect(hexToRgb("ff8800")).toEqual([255, 136, 0]);
  });

  it("is case-insensitive", () => {
    expect(hexToRgb("#FF8800")).toEqual([255, 136, 0]);
  });

  it("trims surrounding whitespace", () => {
    expect(hexToRgb("  #000000  ")).toEqual([0, 0, 0]);
  });

  it("parses CSS's 3-digit shorthand, doubling each digit", () => {
    expect(hexToRgb("#f80")).toEqual([255, 136, 0]);
    expect(hexToRgb("f80")).toEqual([255, 136, 0]);
    expect(hexToRgb("#fff")).toEqual([255, 255, 255]);
  });

  it("throws a descriptive error for an unparseable value", () => {
    expect(() => hexToRgb("not-a-color")).toThrow(
      /couldn't parse palette color/,
    );
    expect(() => hexToRgb("#ff88")).toThrow(/couldn't parse palette color/);
  });
});
