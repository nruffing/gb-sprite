import { describe, expect, it } from "vitest";
import { generateMapCode } from "./generateMapCode.js";

describe("generateMapCode", () => {
  it("lays tile indices out mapWidth per row", () => {
    expect(generateMapCode("Sprite", 4, 2)).toBe(
      "unsigned char SpriteMap[] =\n" +
        "{\n" +
        "    0x00,0x01,\n" +
        "    0x02,0x03,\n" +
        "};",
    );
  });

  it("fills the last row short when tileCount doesn't divide evenly", () => {
    expect(generateMapCode("Sprite", 5, 2)).toBe(
      "unsigned char SpriteMap[] =\n" +
        "{\n" +
        "    0x00,0x01,\n" +
        "    0x02,0x03,\n" +
        "    0x04,\n" +
        "};",
    );
  });

  it("puts one tile per row when mapWidth is 1", () => {
    expect(generateMapCode("Sprite", 3, 1)).toBe(
      "unsigned char SpriteMap[] =\n" +
        "{\n" +
        "    0x00,\n" +
        "    0x01,\n" +
        "    0x02,\n" +
        "};",
    );
  });

  it("uses the given tileset name in the array declaration", () => {
    expect(generateMapCode("MySprite", 1, 1)).toContain(
      "unsigned char MySpriteMap[]",
    );
  });
});
