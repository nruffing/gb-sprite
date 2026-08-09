import styles from "./TilePreview.css?inline";
import { decodePixels } from "./pixelsAttribute.js";

const TILE_SIDE = 8;
// Matches the --tile-preview-scale default in style.css — only used if that
// custom property somehow resolves empty.
const DEFAULT_SCALE = 4;

// Renders a tile to a <canvas> (rather than a grid of elements) so pixels
// sit adjacent with zero seams at any scale factor, including non-integer ones.
//
// Deliberately has no knowledge of frameStore — set the `pixels` attribute
// (see pixelsAttribute.js) to the tile data to render; renders blank if
// unset. Callers that read from frameStore (TileGallery, FramePreview) own
// encoding/updating that attribute themselves.
//
// Rendered size comes from the --tile-preview-scale CSS custom property
// (style.css), not an HTML attribute — TileGallery/FramePreview override it
// locally to their own scale (:host { --tile-preview-scale: N }). Reading it
// as CSS rather than an attribute lets ancestors calc() a tile's rendered
// size themselves (see FrameGallery.css) instead of having to measure it
// from the DOM after render.
class TilePreview extends HTMLElement {
  static get observedAttributes() {
    return ["pixels", "flip-x", "flip-y"];
  }

  #canvas;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = /* html */ `
      <style>${styles}</style>
      <canvas></canvas>
    `;
    this.#canvas = shadow.querySelector("canvas");
  }

  connectedCallback() {
    this.#render();
  }

  attributeChangedCallback() {
    this.#render();
  }

  #render() {
    const computedStyle = getComputedStyle(this);
    const scale =
      Number(computedStyle.getPropertyValue("--tile-preview-scale")) ||
      DEFAULT_SCALE;
    this.#canvas.width = TILE_SIDE;
    this.#canvas.height = TILE_SIDE;
    this.#canvas.style.width = `${TILE_SIDE * scale}px`;
    this.#canvas.style.height = `${TILE_SIDE * scale}px`;

    const ctx = this.#canvas.getContext("2d");
    ctx.clearRect(0, 0, TILE_SIDE, TILE_SIDE);

    const pixels = decodePixels(this.getAttribute("pixels"));
    if (!pixels) return;

    const flipX = this.hasAttribute("flip-x");
    const flipY = this.hasAttribute("flip-y");

    pixels.forEach((colorIndex, index) => {
      const x = index % TILE_SIDE;
      const y = Math.floor(index / TILE_SIDE);
      const drawX = flipX ? TILE_SIDE - 1 - x : x;
      const drawY = flipY ? TILE_SIDE - 1 - y : y;
      ctx.fillStyle = computedStyle.getPropertyValue(
        `--gbs-palette-${colorIndex}`,
      );
      ctx.fillRect(drawX, drawY, 1, 1);
    });
  }
}
customElements.define("tile-preview", TilePreview);
