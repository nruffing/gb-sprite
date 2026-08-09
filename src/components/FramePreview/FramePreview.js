import styles from "./FramePreview.css?inline";
import { frameStore } from "../../state/frameStore.js";
import { encodePixels } from "../TilePreview/pixelsAttribute.js";

// Flipping the whole assembled frame (not just each tile's own pixels) needs
// to also swap tiles across the grid — columns for flip-X, rows for flip-Y —
// so the frame's silhouette mirrors correctly, not just each tile in place.
// Each <tile-preview>'s grid slot (`data-position`) stays fixed; #render()
// remaps which source tile's pixels get encoded into that slot's `pixels`
// attribute (tile-preview itself has no knowledge of frameStore).
class FramePreview extends HTMLElement {
  static get observedAttributes() {
    return ["frame-index"];
  }

  #flipX = false;
  #flipY = false;
  #tilePreviews;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    const { tiles, mapWidth } = this.#resolveFrame();
    shadow.innerHTML = /* html */ `
      <style>${styles}</style>
      <div class="container">
        <div class="preview" style="--map-width: ${mapWidth}">
        ${tiles
          .map(
            (_tile, position) => /* html */ `
          <tile-preview scale="12" data-position="${position}"></tile-preview>
          `,
          )
          .join("")}
        </div>
        <div class="switches">
          <toggle-switch label="Flip-X" data-flip="x"></toggle-switch>
          <toggle-switch label="Flip-Y" data-flip="y"></toggle-switch>
        </div>
      </div>
      `;

    this.#tilePreviews = shadow.querySelectorAll("tile-preview");
    shadow.querySelectorAll("toggle-switch").forEach((toggleSwitch) => {
      const axis = toggleSwitch.dataset.flip;
      toggleSwitch.addEventListener("change", (event) => {
        if (axis === "x") {
          this.#flipX = event.detail.checked;
        } else {
          this.#flipY = event.detail.checked;
        }
        this.#render();
      });
    });
  }

  connectedCallback() {
    frameStore.addEventListener("change", this.#onFrameStoreChange);
    this.#render();
  }

  disconnectedCallback() {
    frameStore.removeEventListener("change", this.#onFrameStoreChange);
  }

  attributeChangedCallback() {
    this.#render();
  }

  #onFrameStoreChange = () => {
    this.#render();
  };

  // Which frame to render: the `frame-index` attribute if set, otherwise
  // frameStore's currently selected frame. Lets a bare <frame-preview> keep
  // tracking whatever's being edited, while an explicit frame-index lets a
  // caller (e.g. a future frame gallery listing every frame) pin an instance
  // to one specific frame regardless of selection.
  #resolveFrame() {
    const frameIndexAttr = this.getAttribute("frame-index");
    const frameIndex =
      frameIndexAttr === null
        ? frameStore.selectedFrameIndex
        : Number(frameIndexAttr);
    return frameStore.frames[frameIndex] ?? frameStore.selectedFrame;
  }

  #render() {
    const { tiles, mapWidth } = this.#resolveFrame();
    const numRows = tiles.length / mapWidth;
    this.#tilePreviews.forEach((tilePreview) => {
      const position = Number(tilePreview.dataset.position);
      const row = Math.floor(position / mapWidth);
      const col = position % mapWidth;
      const sourceRow = this.#flipY ? numRows - 1 - row : row;
      const sourceCol = this.#flipX ? mapWidth - 1 - col : col;
      const sourceIndex = sourceRow * mapWidth + sourceCol;

      tilePreview.setAttribute(
        "pixels",
        encodePixels(tiles[sourceIndex].pixels),
      );
      tilePreview.toggleAttribute("flip-x", this.#flipX);
      tilePreview.toggleAttribute("flip-y", this.#flipY);
    });
  }
}
customElements.define("frame-preview", FramePreview);
