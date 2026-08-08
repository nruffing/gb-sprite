import styles from "./SpritePreview.css?inline";
import { tileStore, MAP_WIDTH } from "../../state/tileStore";
import { encodePixels } from "../TilePreview/pixelsAttribute.js";

// Flipping the whole assembled sprite (not just each tile's own pixels) needs
// to also swap tiles across the grid — columns for flip-X, rows for flip-Y —
// so the frame's silhouette mirrors correctly, not just each tile in place.
// Each <tile-preview>'s grid slot (`data-position`) stays fixed; #render()
// remaps which source tile's pixels get encoded into that slot's `pixels`
// attribute (tile-preview itself has no knowledge of tileStore).
class SpritePreview extends HTMLElement {
  #flipX = false;
  #flipY = false;
  #tilePreviews;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = /* html */ `
      <style>${styles}</style>
      <div class="container">
        <div class="preview" style="--map-width: ${MAP_WIDTH}">
        ${tileStore.tiles
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
    tileStore.addEventListener("change", this.#onTileStoreChange);
    this.#render();
  }

  disconnectedCallback() {
    tileStore.removeEventListener("change", this.#onTileStoreChange);
  }

  #onTileStoreChange = () => {
    this.#render();
  };

  #render() {
    const numRows = tileStore.tiles.length / MAP_WIDTH;
    this.#tilePreviews.forEach((tilePreview) => {
      const position = Number(tilePreview.dataset.position);
      const row = Math.floor(position / MAP_WIDTH);
      const col = position % MAP_WIDTH;
      const sourceRow = this.#flipY ? numRows - 1 - row : row;
      const sourceCol = this.#flipX ? MAP_WIDTH - 1 - col : col;
      const sourceIndex = sourceRow * MAP_WIDTH + sourceCol;

      tilePreview.setAttribute(
        "pixels",
        encodePixels(tileStore.tiles[sourceIndex].pixels),
      );
      tilePreview.toggleAttribute("flip-x", this.#flipX);
      tilePreview.toggleAttribute("flip-y", this.#flipY);
    });
  }
}
customElements.define("sprite-preview", SpritePreview);
