import { describe, expect, it } from "vitest";
import { decodePixels, encodePixels } from "./pixelsAttribute.js";

describe("encodePixels", () => {
  it("joins pixel color indices with commas", () => {
    expect(encodePixels([0, 1, 2, 3])).toBe("0,1,2,3");
  });

  it("returns an empty string for an empty array", () => {
    expect(encodePixels([])).toBe("");
  });

  it("handles a single pixel with no trailing comma", () => {
    expect(encodePixels([2])).toBe("2");
  });
});

describe("decodePixels", () => {
  it("returns null for null, undefined, or an empty string", () => {
    expect(decodePixels(null)).toBeNull();
    expect(decodePixels(undefined)).toBeNull();
    expect(decodePixels("")).toBeNull();
  });

  it("parses a comma-separated list of pixel color indices", () => {
    expect(decodePixels("0,1,2,3")).toEqual([0, 1, 2, 3]);
  });

  it("parses a single value with no commas", () => {
    expect(decodePixels("2")).toEqual([2]);
  });
});

describe("encodePixels/decodePixels round-trip", () => {
  it("recovers the original array for a non-trivial tile", () => {
    const pixels = [0, 3, 1, 2, 2, 1, 3, 0];
    expect(decodePixels(encodePixels(pixels))).toEqual(pixels);
  });
});
