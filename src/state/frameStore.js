import {
  PIXEL_COUNT,
  applyTilesToFrame,
  isValidTilesArray,
} from "./frameSchema.js";

export { PIXEL_COUNT };
export const MAP_WIDTH = 2; // tiles per row when a frame is laid out as a sprite/map
export const INITIAL_TILE_COUNT = 4;

const SCHEMA_VERSION = 2;

export class Tile {
  #pixels = new Array(PIXEL_COUNT).fill(0);

  get pixels() {
    return this.#pixels;
  }

  setPixel(index, colorIndex) {
    this.#pixels[index] = colorIndex;
  }
}

// A Frame is an N-tile sprite — a fixed-size sequence of Tiles laid out
// mapWidth tiles per row.
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

export class FrameStore extends EventTarget {
  // Starts with a single frame, matching what used to be tileStore's fixed
  // sprite (INITIAL_TILE_COUNT tiles) — nothing populates additional frames
  // yet, but every tile-editing operation below is already scoped through
  // selectedFrame so multi-frame support is additive later, not a rewrite.
  #frames = [new Frame()];
  #selectedFrameIndex = 0;
  #selectedTileIndex = 0;

  get frames() {
    return this.#frames;
  }

  get selectedFrameIndex() {
    return this.#selectedFrameIndex;
  }

  get selectedFrame() {
    return this.#frames[this.#selectedFrameIndex];
  }

  get selectedTileIndex() {
    return this.#selectedTileIndex;
  }

  // Appends a new blank Frame (same tile count/mapWidth as the rest) and
  // selects it.
  addFrame() {
    this.#frames.push(new Frame());
    this.setSelectedFrameIndex(this.#frames.length - 1);
  }

  isValidFrameIndex(index) {
    return Number.isInteger(index) && index >= 0 && index < this.#frames.length;
  }

  setSelectedFrameIndex(index) {
    if (!this.isValidFrameIndex(index)) {
      console.warn(`[gb-sprite] tried to set selected frame to index ${index}`);
      return;
    }

    this.#selectedFrameIndex = index;
    this.#selectedTileIndex = 0;
    this.#dispatchChange();
  }

  isValidTileIndex(index) {
    return (
      Number.isInteger(index) &&
      index >= 0 &&
      index < this.selectedFrame.tiles.length
    );
  }

  setSelectedTileIndex(index) {
    if (!this.isValidTileIndex(index)) {
      console.warn(`[gb-sprite] tried to set selected tile to index ${index}`);
      return;
    }

    this.#selectedTileIndex = index;
    this.#dispatchChange();
  }

  setPixel(pixelIndex, colorIndex) {
    const tile = this.selectedFrame.tiles[this.#selectedTileIndex];
    if (!tile) {
      console.warn(
        `[gb-sprite] tried to set pixel on tile with index ${this.#selectedTileIndex}`,
      );
      return;
    }
    tile.setPixel(pixelIndex, colorIndex);
    this.#dispatchChange();
  }

  // Called by JSON.stringify(frameStore) for save/export — exports every
  // frame (schema v2) as a 3D array: frames[frameIndex][tileIndex] is a
  // tile's PIXEL_COUNT-length pixel array.
  toJSON() {
    return {
      version: SCHEMA_VERSION,
      pixelCount: PIXEL_COUNT,
      mapWidth: MAP_WIDTH,
      frames: this.#frames.map((frame) =>
        frame.tiles.map((tile) => tile.pixels),
      ),
    };
  }

  // Validates parsed save/import data against whichever schema version it
  // claims to be. v1 (a single frame's tiles, matching the selected frame's
  // current tile count) and v2 (every frame, as a 3D array) are both
  // accepted so old exports still import.
  isValidTilesData(data) {
    const { version, pixelCount } = data ?? {};
    if (pixelCount !== PIXEL_COUNT) return false;

    if (version === 1) {
      return isValidTilesArray(data.tiles, this.selectedFrame.tiles.length);
    }

    if (version === 2) {
      return (
        Array.isArray(data.frames) &&
        data.frames.length > 0 &&
        data.frames.every((tiles) => isValidTilesArray(tiles))
      );
    }

    return false;
  }

  // Loads parsed save/import data (the shape toJSON produces, v1 or v2).
  // Returns whether the load succeeded.
  //
  // v1 data only ever described one frame, so it's applied to the currently
  // selected frame's existing Tile instances in place (not replaced) —
  // anything holding a reference to selectedFrame.tiles sees the update
  // rather than going stale. v2 data describes every frame, so frame count
  // itself may need to change — the whole frames array is replaced with
  // freshly built Frames instead.
  loadTiles(data) {
    if (!this.isValidTilesData(data)) {
      console.warn("[gb-sprite] tried to load invalid tileset data", data);
      return false;
    }

    if (data.version === 1) {
      applyTilesToFrame(this.selectedFrame, data.tiles);
    } else {
      this.#frames = data.frames.map((tiles) => {
        const frame = new Frame(tiles.length, data.mapWidth ?? MAP_WIDTH);
        applyTilesToFrame(frame, tiles);
        return frame;
      });
      this.#selectedFrameIndex = 0;
    }

    this.#selectedTileIndex = 0;
    this.#dispatchChange();
    return true;
  }

  #dispatchChange() {
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: {
          frames: this.#frames,
          selectedFrameIndex: this.#selectedFrameIndex,
          selectedTileIndex: this.#selectedTileIndex,
        },
      }),
    );
  }
}

export const frameStore = new FrameStore();
