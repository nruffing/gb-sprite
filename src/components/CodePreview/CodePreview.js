import styles from "./CodePreview.css?inline";
import { spriteStore } from "../../state/spriteStore.js";
import { generateTilesCode } from "./generateTilesCode.js";

class CodePreview extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = /* html */ `
      <style>${styles}</style>
      <div class="header">
        <input type="text" value="Tileset" placeholder="Tileset Name" />
        <button type="button">Copy to clipboard</button>
      </div>
      <pre><code></code></pre>
    `;

    const nameInput = shadow.querySelector("input");
    const copyButton = shadow.querySelector("button");
    const codeElement = shadow.querySelector("code");

    const render = () => {
      codeElement.textContent = generateTilesCode(nameInput.value || "Tileset", spriteStore.pixels);
    };

    nameInput.addEventListener("input", render);
    copyButton.addEventListener("click", () => {
      navigator.clipboard.writeText(codeElement.textContent);
    });
    spriteStore.addEventListener("change", render);

    render();
  }
}
customElements.define("code-preview", CodePreview);
