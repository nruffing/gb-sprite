import { describe, expect, it } from "vitest";
import { generateTilesCode } from "./generateTilesCode.js";

const ROW = 8;
const TILE_PIXELS = ROW * ROW;

function solidTile(colorIndex) {
  return new Array(TILE_PIXELS).fill(colorIndex);
}

describe("generateTilesCode", () => {
  it("packs an all-color-0 row as 0x00/0x00 (both bit planes clear)", () => {
    expect(generateTilesCode("Foo", [solidTile(0)])).toContain(
      "0x00,0x00,0x00,0x00",
    );
  });

  it("packs an all-color-3 row as 0xFF/0xFF (both bit planes set)", () => {
    expect(generateTilesCode("Foo", [solidTile(3)])).toContain(
      "0xFF,0xFF,0xFF,0xFF",
    );
  });

  it("packs mixed color indices into the correct lsb/msb planes", () => {
    // colors 1,2,3,0,1,2,3,0 -> lsb (colors 1 or 3) = 10101010 = 0xAA,
    // msb (colors 2 or 3) = 01100110 = 0x66
    const tile = [1, 2, 3, 0, 1, 2, 3, 0, ...new Array(56).fill(0)];
    expect(generateTilesCode("Foo", [tile])).toContain("0xAA,0x66,");
  });

  it("emits 2 bytes per row, 8 rows per tile, in row order, with no line wrap for one tile", () => {
    expect(generateTilesCode("Foo", [solidTile(0)])).toBe(
      "unsigned char FooTiles[] =\n" +
        "{\n" +
        "    " +
        "0x00,".repeat(16) +
        "\n" +
        "};",
    );
  });

  it("wraps to a new line every 16 bytes, spanning multiple tiles", () => {
    const output = generateTilesCode("Foo", [solidTile(3), solidTile(0)]);
    expect(output).toBe(
      "unsigned char FooTiles[] =\n" +
        "{\n" +
        "    " +
        "0xFF,".repeat(16) +
        "\n    " +
        "0x00,".repeat(16) +
        "\n" +
        "};",
    );
  });

  it("uses the given tileset name in the array declaration", () => {
    expect(generateTilesCode("MySprite", [solidTile(0)])).toContain(
      "unsigned char MySpriteTiles[]",
    );
  });
});
