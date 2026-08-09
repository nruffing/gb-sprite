import { describe, expect, it } from "vitest";
import { PointerState } from "./pointerState.js";

describe("PointerState", () => {
  it("starts with isDown false", () => {
    expect(new PointerState().isDown).toBe(false);
  });

  it("setDown updates isDown", () => {
    const state = new PointerState();
    state.setDown(true);
    expect(state.isDown).toBe(true);
    state.setDown(false);
    expect(state.isDown).toBe(false);
  });

  describe("attach", () => {
    it("sets isDown true on the target's pointerdown, false on pointerup", () => {
      const state = new PointerState();
      const target = new EventTarget();
      state.attach(target);

      target.dispatchEvent(new Event("pointerdown"));
      expect(state.isDown).toBe(true);

      target.dispatchEvent(new Event("pointerup"));
      expect(state.isDown).toBe(false);
    });

    it("doesn't touch any target until attach is called", () => {
      // Importing/constructing PointerState must not require a `window`
      // global — this is exactly what makes it testable in Vitest's
      // node environment without jsdom. If attach() ran at module load or
      // in the constructor, this test file couldn't even import it.
      const state = new PointerState();
      expect(state.isDown).toBe(false);
    });
  });
});
