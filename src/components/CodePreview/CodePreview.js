import styles from "./CodePreview.css?inline";
import { tileStore, MAP_WIDTH } from "../../state/tileStore.js";
import { generateTilesCode } from "./generateTilesCode.js";
import { generateMapCode } from "./generateMapCode.js";
import { highlightCCode } from "./highlightCCode.js";
import "../SvgIcon/SvgIcon.js";

const DEFAULT_TILESET_NAME = "Tileset";

class CodePreview extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = /* html */ `
      <style>${styles}</style>
      <div class="code-wrapper">
        <button type="button" aria-label="Copy to clipboard" title="Copy to clipboard">
          <svg-icon name="copy"></svg-icon>
        </button>
        <pre><code></code></pre>
      </div>
      <div class="footer">
        <label>
          <span>Tileset Name</span>
          <input type="text" name="tilesetName" value="${DEFAULT_TILESET_NAME}" />
        </label>
      </div>
    `;

    const nameInput = shadow.querySelector("input");
    const copyButton = shadow.querySelector("button");
    const codeElement = shadow.querySelector("code");

    let currentCode = "";

    const render = () => {
      const tilesetName = nameInput.value || "Tileset";
      const tilesCode = generateTilesCode(
        tilesetName,
        tileStore.tiles.map((tile) => tile.pixels),
      );
      const mapCode = generateMapCode(
        tilesetName,
        tileStore.tiles.length,
        MAP_WIDTH,
      );
      currentCode = `${tilesCode}\n\n${mapCode}`;
      codeElement.replaceChildren(highlightCCode(currentCode));
    };

    nameInput.addEventListener("input", render);
    copyButton.addEventListener("click", () => {
      navigator.clipboard.writeText(currentCode);
    });
    tileStore.addEventListener("change", render);

    render();
  }
}
customElements.define("code-preview", CodePreview);
