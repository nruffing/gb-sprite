import { describe, expect, it } from "vitest";
import { toHexByte } from "./hexUtils.js";

describe("toHexByte", () => {
  it("pads single hex digits to two digits", () => {
    expect(toHexByte(0)).toBe("0x00");
    expect(toHexByte(1)).toBe("0x01");
    expect(toHexByte(15)).toBe("0x0F");
  });

  it("doesn't pad two-digit hex values", () => {
    expect(toHexByte(16)).toBe("0x10");
    expect(toHexByte(255)).toBe("0xFF");
  });

  it("uppercases hex letters", () => {
    expect(toHexByte(0xab)).toBe("0xAB");
  });
});
