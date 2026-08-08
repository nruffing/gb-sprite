import styles from "./SpritePreview.css?inline";
import { tileStore, MAP_WIDTH } from "../../state/tileStore";

class SpritePreview extends HTMLElement {
  #tiles = tileStore.tiles;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = /* html */ `
      <style>${styles}</style>
      <div class="container">
        <div class="preview" style="--map-width: ${MAP_WIDTH}">
        ${this.#tiles
          .map(
            (_tile, index) => /* html */ `
          <tile-preview scale="12" tile-index="${index}"></tile-preview>
          `,
          )
          .join("")}
        </div>
        <div class="switches">
          <toggle-switch label="Flip-X"></toggle-switch>
          <toggle-switch label="Flip-Y"></toggle-switch>
        </div>
      </div>
      `;
  }
}
customElements.define("sprite-preview", SpritePreview);
