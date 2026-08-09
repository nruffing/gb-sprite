import { describe, expect, it, vi } from "vitest";
import {
  Frame,
  FrameStore,
  INITIAL_TILE_COUNT,
  MAP_WIDTH,
  PIXEL_COUNT,
  Tile,
} from "./frameStore.js";

function validPixels(fill = 0) {
  return new Array(PIXEL_COUNT).fill(fill);
}

describe("Tile", () => {
  it("starts with all-zero pixels", () => {
    expect(new Tile().pixels).toEqual(validPixels(0));
  });

  it("setPixel writes a single pixel by index", () => {
    const tile = new Tile();
    tile.setPixel(5, 3);
    expect(tile.pixels[5]).toBe(3);
    expect(tile.pixels.filter((p) => p !== 0)).toHaveLength(1);
  });
});

describe("Frame", () => {
  it("defaults to INITIAL_TILE_COUNT tiles and MAP_WIDTH", () => {
    const frame = new Frame();
    expect(frame.tiles).toHaveLength(INITIAL_TILE_COUNT);
    expect(frame.mapWidth).toBe(MAP_WIDTH);
  });

  it("accepts a custom tile count and mapWidth", () => {
    const frame = new Frame(6, 3);
    expect(frame.tiles).toHaveLength(6);
    expect(frame.mapWidth).toBe(3);
  });

  it("gives each tile independent pixel storage", () => {
    const frame = new Frame(2);
    frame.tiles[0].setPixel(0, 1);
    expect(frame.tiles[1].pixels[0]).toBe(0);
  });
});

describe("FrameStore", () => {
  it("starts with a single frame selected, at tile index 0", () => {
    const store = new FrameStore();
    expect(store.frames).toHaveLength(1);
    expect(store.selectedFrameIndex).toBe(0);
    expect(store.selectedTileIndex).toBe(0);
    expect(store.selectedFrame).toBe(store.frames[0]);
  });

  describe("addFrame", () => {
    it("appends a new frame and selects it", () => {
      const store = new FrameStore();
      store.addFrame();
      expect(store.frames).toHaveLength(2);
      expect(store.selectedFrameIndex).toBe(1);
      expect(store.selectedFrame).toBe(store.frames[1]);
    });

    it("dispatches a change event", () => {
      const store = new FrameStore();
      const listener = vi.fn();
      store.addEventListener("change", listener);

      store.addFrame();

      expect(listener).toHaveBeenCalledOnce();
    });
  });

  describe("isValidFrameIndex / setSelectedFrameIndex", () => {
    it("accepts an in-range index", () => {
      const store = new FrameStore();
      store.addFrame();
      expect(store.isValidFrameIndex(0)).toBe(true);
      expect(store.isValidFrameIndex(1)).toBe(true);
    });

    it("rejects a negative, out-of-range, or non-integer index", () => {
      const store = new FrameStore();
      expect(store.isValidFrameIndex(-1)).toBe(false);
      expect(store.isValidFrameIndex(1)).toBe(false);
      expect(store.isValidFrameIndex(0.5)).toBe(false);
    });

    it("updates selectedFrameIndex and resets selectedTileIndex to 0", () => {
      const store = new FrameStore();
      store.addFrame();
      store.setSelectedTileIndex(2);

      store.setSelectedFrameIndex(0);

      expect(store.selectedFrameIndex).toBe(0);
      expect(store.selectedTileIndex).toBe(0);
    });

    it("warns and leaves state unchanged for an invalid index", () => {
      const store = new FrameStore();
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const listener = vi.fn();
      store.addEventListener("change", listener);

      store.setSelectedFrameIndex(5);

      expect(store.selectedFrameIndex).toBe(0);
      expect(warn).toHaveBeenCalledOnce();
      expect(listener).not.toHaveBeenCalled();

      warn.mockRestore();
    });
  });

  describe("isValidTileIndex / setSelectedTileIndex", () => {
    it("accepts an in-range index for the selected frame", () => {
      const store = new FrameStore();
      expect(store.isValidTileIndex(0)).toBe(true);
      expect(store.isValidTileIndex(INITIAL_TILE_COUNT - 1)).toBe(true);
    });

    it("rejects an out-of-range or non-integer index", () => {
      const store = new FrameStore();
      expect(store.isValidTileIndex(-1)).toBe(false);
      expect(store.isValidTileIndex(INITIAL_TILE_COUNT)).toBe(false);
      expect(store.isValidTileIndex(1.5)).toBe(false);
    });

    it("updates selectedTileIndex and dispatches a change event", () => {
      const store = new FrameStore();
      const listener = vi.fn();
      store.addEventListener("change", listener);

      store.setSelectedTileIndex(1);

      expect(store.selectedTileIndex).toBe(1);
      expect(listener).toHaveBeenCalledOnce();
    });

    it("warns and leaves state unchanged for an invalid index", () => {
      const store = new FrameStore();
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

      store.setSelectedTileIndex(99);

      expect(store.selectedTileIndex).toBe(0);
      expect(warn).toHaveBeenCalledOnce();

      warn.mockRestore();
    });
  });

  describe("setPixel", () => {
    it("writes a pixel onto the selected tile of the selected frame", () => {
      const store = new FrameStore();
      store.setSelectedTileIndex(1);

      store.setPixel(4, 2);

      expect(store.selectedFrame.tiles[1].pixels[4]).toBe(2);
      expect(store.selectedFrame.tiles[0].pixels[4]).toBe(0);
    });

    it("dispatches a change event", () => {
      const store = new FrameStore();
      const listener = vi.fn();
      store.addEventListener("change", listener);

      store.setPixel(0, 1);

      expect(listener).toHaveBeenCalledOnce();
    });

    it("warns and does nothing if the selected tile doesn't exist", () => {
      const store = new FrameStore();
      // A v2 import can produce a frame with 0 tiles (isValidTilesArray
      // allows an empty array) — selectedTileIndex then points nowhere.
      store.loadTiles({
        version: 2,
        pixelCount: PIXEL_COUNT,
        frames: [[]],
      });
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

      store.setPixel(0, 1);

      expect(warn).toHaveBeenCalledOnce();
      warn.mockRestore();
    });
  });

  describe("toJSON", () => {
    it("exports schema v2: every frame as a 3D pixels array", () => {
      const store = new FrameStore();
      store.setPixel(0, 2);
      store.addFrame();
      store.setPixel(1, 3);

      const payload = store.toJSON();

      expect(payload.version).toBe(2);
      expect(payload.pixelCount).toBe(PIXEL_COUNT);
      expect(payload.mapWidth).toBe(MAP_WIDTH);
      expect(payload.frames).toHaveLength(2);
      expect(payload.frames[0][0][0]).toBe(2);
      expect(payload.frames[1][0][1]).toBe(3);
    });
  });

  describe("isValidTilesData", () => {
    it("rejects null/undefined or a mismatched pixelCount", () => {
      const store = new FrameStore();
      expect(store.isValidTilesData(null)).toBe(false);
      expect(store.isValidTilesData(undefined)).toBe(false);
      expect(store.isValidTilesData({ pixelCount: PIXEL_COUNT - 1 })).toBe(
        false,
      );
    });

    it("v1: requires tiles to match the selected frame's current tile count", () => {
      const store = new FrameStore();
      const tiles = Array.from({ length: INITIAL_TILE_COUNT }, () =>
        validPixels(),
      );
      expect(
        store.isValidTilesData({
          version: 1,
          pixelCount: PIXEL_COUNT,
          tiles,
        }),
      ).toBe(true);
      expect(
        store.isValidTilesData({
          version: 1,
          pixelCount: PIXEL_COUNT,
          tiles: tiles.slice(0, -1),
        }),
      ).toBe(false);
    });

    it("v2: requires a non-empty array of valid per-frame tile arrays", () => {
      const store = new FrameStore();
      expect(
        store.isValidTilesData({
          version: 2,
          pixelCount: PIXEL_COUNT,
          frames: [[validPixels()], [validPixels(), validPixels()]],
        }),
      ).toBe(true);
      expect(
        store.isValidTilesData({
          version: 2,
          pixelCount: PIXEL_COUNT,
          frames: [],
        }),
      ).toBe(false);
      expect(
        store.isValidTilesData({
          version: 2,
          pixelCount: PIXEL_COUNT,
          frames: [[[1, 2, 3]]],
        }),
      ).toBe(false);
    });

    it("rejects an unrecognized version", () => {
      const store = new FrameStore();
      expect(
        store.isValidTilesData({ version: 3, pixelCount: PIXEL_COUNT }),
      ).toBe(false);
    });
  });

  describe("loadTiles", () => {
    it("v1: applies pixels onto the selected frame's existing Tile instances in place", () => {
      const store = new FrameStore();
      const originalTiles = store.selectedFrame.tiles;
      const originalTileCount = originalTiles.length;
      const tiles = Array.from({ length: originalTileCount }, (_, i) =>
        validPixels(i),
      );

      const result = store.loadTiles({
        version: 1,
        pixelCount: PIXEL_COUNT,
        tiles,
      });

      expect(result).toBe(true);
      expect(store.selectedFrame.tiles).toBe(originalTiles); // same array, not replaced
      expect(store.selectedFrame.tiles[1].pixels).toEqual(validPixels(1));
    });

    it("v2: replaces the whole frames array, changing frame count if needed", () => {
      const store = new FrameStore();
      const originalFrames = store.frames;

      const result = store.loadTiles({
        version: 2,
        pixelCount: PIXEL_COUNT,
        mapWidth: 3,
        frames: [[validPixels(1)], [validPixels(2)], [validPixels(3)]],
      });

      expect(result).toBe(true);
      expect(store.frames).not.toBe(originalFrames);
      expect(store.frames).toHaveLength(3);
      expect(store.frames[0].tiles).toHaveLength(1);
      expect(store.frames[0].tiles[0].pixels).toEqual(validPixels(1));
      expect(store.frames[0].mapWidth).toBe(3);
      expect(store.selectedFrameIndex).toBe(0);
    });

    it("resets selectedTileIndex to 0 and dispatches a change event on success", () => {
      const store = new FrameStore();
      store.setSelectedTileIndex(2);
      const listener = vi.fn();
      store.addEventListener("change", listener);

      store.loadTiles({
        version: 2,
        pixelCount: PIXEL_COUNT,
        frames: [[validPixels()]],
      });

      expect(store.selectedTileIndex).toBe(0);
      expect(listener).toHaveBeenCalledOnce();
    });

    it("returns false, warns, and dispatches nothing for invalid data", () => {
      const store = new FrameStore();
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const listener = vi.fn();
      store.addEventListener("change", listener);

      const result = store.loadTiles({ version: 2, pixelCount: 1 });

      expect(result).toBe(false);
      expect(warn).toHaveBeenCalledOnce();
      expect(listener).not.toHaveBeenCalled();

      warn.mockRestore();
    });
  });
});
