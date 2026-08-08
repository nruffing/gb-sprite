import { INITIAL_TILE_COUNT, MAP_WIDTH, Tile } from "./tileStore.js";

// A Frame is an N-tile sprite — a fixed-size sequence of Tiles laid out
// mapWidth tiles per row (see tileStore.js's MAP_WIDTH-per-row layout).
export class Frame {
  #tiles;
  #mapWidth;

  constructor(tileCount = INITIAL_TILE_COUNT, mapWidth = MAP_WIDTH) {
    this.#tiles = Array.from({ length: tileCount }, () => new Tile());
    this.#mapWidth = mapWidth;
  }

  get tiles() {
    return this.#tiles;
  }

  get mapWidth() {
    return this.#mapWidth;
  }
}

class FrameStore extends EventTarget {
  // Starts with a single frame, matching tileStore's current fixed sprite
  // (INITIAL_TILE_COUNT tiles) — nothing consumes multiple frames yet.
  #frames = [new Frame()];

  get frames() {
    return this.#frames;
  }
}

export const frameStore = new FrameStore();
