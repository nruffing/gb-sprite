import styles from "./SpritePreview.css?inline";
import { tileStore } from "../../state/tileStore";

class SpritePreview extends HTMLElement {
  #tiles = tileStore.tiles;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = /* html */ `
        <style>${styles}</style>
        <div class="preview">
        ${this.#tiles
          .map(
            (_tile, index) => /* html */ `
          <tile-preview scale="12" tile-index="${index}"></tile-preview>
          `,
          )
          .join("")}
        </div>
      `;
  }
}
customElements.define("sprite-preview", SpritePreview);
