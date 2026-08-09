import { describe, expect, it, vi } from "vitest";
import { PALETTE_SIZE, PaletteStore } from "./paletteStore.js";

describe("PaletteStore", () => {
  it("starts at the index passed to its constructor", () => {
    const store = new PaletteStore(2);
    expect(store.selectedColorIndex).toBe(2);
  });

  describe("isValidColorIndex", () => {
    it.each([0, 1, PALETTE_SIZE - 1])(
      "accepts an in-range integer index (%i)",
      (index) => {
        expect(new PaletteStore(0).isValidColorIndex(index)).toBe(true);
      },
    );

    it("rejects a negative index", () => {
      expect(new PaletteStore(0).isValidColorIndex(-1)).toBe(false);
    });

    it("rejects an index at or beyond PALETTE_SIZE", () => {
      const store = new PaletteStore(0);
      expect(store.isValidColorIndex(PALETTE_SIZE)).toBe(false);
      expect(store.isValidColorIndex(PALETTE_SIZE + 1)).toBe(false);
    });

    it("rejects a non-integer index", () => {
      expect(new PaletteStore(0).isValidColorIndex(1.5)).toBe(false);
    });
  });

  describe("setSelectedColorIndex", () => {
    it("updates selectedColorIndex for a valid index", () => {
      const store = new PaletteStore(0);
      store.setSelectedColorIndex(3);
      expect(store.selectedColorIndex).toBe(3);
    });

    it("dispatches a change event with the new index in detail", () => {
      const store = new PaletteStore(0);
      const listener = vi.fn();
      store.addEventListener("change", listener);

      store.setSelectedColorIndex(2);

      expect(listener).toHaveBeenCalledOnce();
      expect(listener.mock.calls[0][0].detail).toEqual({
        selectedColorIndex: 2,
      });
    });

    it("silently ignores an invalid index, leaving state and listeners untouched", () => {
      const store = new PaletteStore(1);
      const listener = vi.fn();
      store.addEventListener("change", listener);

      store.setSelectedColorIndex(PALETTE_SIZE);

      expect(store.selectedColorIndex).toBe(1);
      expect(listener).not.toHaveBeenCalled();
    });
  });
});
