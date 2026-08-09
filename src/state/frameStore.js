import { PALETTE_SIZE } from "./paletteStore.js";

export const PIXEL_COUNT = 64; // 8x8 sprite tile
export const MAP_WIDTH = 2; // tiles per row when a frame is laid out as a sprite/map
export const INITIAL_TILE_COUNT = 4;

const SCHEMA_VERSION = 1;

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

class FrameStore extends EventTarget {
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

  // Called by JSON.stringify(frameStore) for save/export — exports the
  // selected frame's tiles.
  toJSON() {
    const frame = this.selectedFrame;
    return {
      version: SCHEMA_VERSION,
      pixelCount: PIXEL_COUNT,
      mapWidth: frame.mapWidth,
      tiles: frame.tiles.map((tile) => tile.pixels),
    };
  }

  isValidTilesData(data) {
    // Tile count is fixed for now — TileGallery/FramePreview build their
    // markup once from the initial tile count and don't rebuild it on change.
    const { version, pixelCount, tiles } = data ?? {};
    if (version !== SCHEMA_VERSION) return false;

    return (
      pixelCount === PIXEL_COUNT &&
      Array.isArray(tiles) &&
      tiles.length === this.selectedFrame.tiles.length &&
      tiles.every(
        (pixels) =>
          Array.isArray(pixels) &&
          pixels.length === PIXEL_COUNT &&
          pixels.every(
            (colorIndex) =>
              Number.isInteger(colorIndex) &&
              colorIndex >= 0 &&
              colorIndex < PALETTE_SIZE,
          ),
      )
    );
  }

  // Replaces the selected frame's tiles from parsed save/import data (the
  // shape toJSON produces). Returns whether the load succeeded. Mutates the
  // existing Tile instances in place rather than replacing the tiles array,
  // so anything holding a reference to selectedFrame.tiles sees the update
  // rather than going stale.
  loadTiles(data) {
    if (!this.isValidTilesData(data)) {
      console.warn("[gb-sprite] tried to load invalid tileset data", data);
      return false;
    }

    const frame = this.selectedFrame;
    data.tiles.forEach((pixels, tileIndex) => {
      pixels.forEach((colorIndex, pixelIndex) =>
        frame.tiles[tileIndex].setPixel(pixelIndex, colorIndex),
      );
    });
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
