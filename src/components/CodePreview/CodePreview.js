import styles from "./CodePreview.css?inline";
import { spriteStore } from "../../state/spriteStore.js";
import { generateTilesCode } from "./generateTilesCode.js";
import { highlightCCode } from "./highlightCCode.js";
import "../SvgIcon/SvgIcon.js";

class CodePreview extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = /* html */ `
      <style>${styles}</style>
      <div class="header">
        <input type="text" value="Tileset" placeholder="Tileset Name" />
      </div>
      <div class="code-wrapper">
        <button type="button" aria-label="Copy to clipboard" title="Copy to clipboard">
          <svg-icon name="copy"></svg-icon>
        </button>
        <pre><code></code></pre>
      </div>
    `;

    const nameInput = shadow.querySelector("input");
    const copyButton = shadow.querySelector("button");
    const codeElement = shadow.querySelector("code");

    let currentCode = "";

    const render = () => {
      currentCode = generateTilesCode(
        nameInput.value || "Tileset",
        spriteStore.pixels,
      );
      codeElement.replaceChildren(highlightCCode(currentCode));
    };

    nameInput.addEventListener("input", render);
    copyButton.addEventListener("click", () => {
      navigator.clipboard.writeText(currentCode);
    });
    spriteStore.addEventListener("change", render);

    render();
  }
}
customElements.define("code-preview", CodePreview);
