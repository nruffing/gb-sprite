import { describe, expect, it, vi } from "vitest";
import { parseResizeOption, ResizeOption } from "./resizeOption.js";

describe("ResizeOption", () => {
  it("assigns each edge a distinct bit", () => {
    const values = Object.values(ResizeOption);
    const uniqueBits = new Set(values);
    expect(uniqueBits.size).toBe(values.length);
    values.forEach((value) => {
      // a power of two: exactly one bit set
      expect(value & (value - 1)).toBe(0);
    });
  });
});

describe("parseResizeOption", () => {
  it("returns 0 for a missing or empty value", () => {
    expect(parseResizeOption(undefined)).toBe(0);
    expect(parseResizeOption(null)).toBe(0);
    expect(parseResizeOption("")).toBe(0);
  });

  it.each([
    ["LEFT", ResizeOption.LEFT],
    ["TOP", ResizeOption.TOP],
    ["RIGHT", ResizeOption.RIGHT],
    ["BOTTOM", ResizeOption.BOTTOM],
  ])("parses a single recognized token %s", (token, expected) => {
    expect(parseResizeOption(token)).toBe(expected);
  });

  it("is case-insensitive and trims whitespace", () => {
    expect(parseResizeOption("left")).toBe(ResizeOption.LEFT);
    expect(parseResizeOption("  LEFT  ")).toBe(ResizeOption.LEFT);
    expect(parseResizeOption("ToP")).toBe(ResizeOption.TOP);
  });

  it("warns and skips unrecognized tokens without throwing", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(parseResizeOption("DIAGONAL")).toBe(0);
    expect(warn).toHaveBeenCalledWith(
      '[gb-sprite] unrecognized resize option "DIAGONAL"',
    );

    warn.mockRestore();
  });

  it("combines two tokens with bitwise OR", () => {
    expect(parseResizeOption("LEFT | TOP")).toBe(
      ResizeOption.LEFT | ResizeOption.TOP,
    );
    expect(parseResizeOption("RIGHT|BOTTOM")).toBe(
      ResizeOption.RIGHT | ResizeOption.BOTTOM,
    );
  });

  it("combines all four edges with bitwise OR, order independent", () => {
    const expected =
      ResizeOption.LEFT |
      ResizeOption.TOP |
      ResizeOption.RIGHT |
      ResizeOption.BOTTOM;

    expect(parseResizeOption("LEFT | TOP | RIGHT | BOTTOM")).toBe(expected);
    expect(parseResizeOption("BOTTOM | RIGHT | TOP | LEFT")).toBe(expected);
  });

  it("ignores duplicate tokens (OR-ing a bit with itself is a no-op)", () => {
    expect(parseResizeOption("LEFT | LEFT")).toBe(ResizeOption.LEFT);
  });

  it("warns per unrecognized token but still combines the recognized ones", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(parseResizeOption("LEFT | DIAGONAL | TOP")).toBe(
      ResizeOption.LEFT | ResizeOption.TOP,
    );
    expect(warn).toHaveBeenCalledOnce();
    expect(warn).toHaveBeenCalledWith(
      '[gb-sprite] unrecognized resize option " DIAGONAL "',
    );

    warn.mockRestore();
  });
});
