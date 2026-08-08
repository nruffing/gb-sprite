import styles from "./DynamicPanel.css?inline";
import {
  getUnsupportedResizeOptions,
  parseResizeOption,
} from "./resizeOption.js";

class DynamicPanel extends HTMLElement {
  static get observedAttributes() {
    return ["resize"];
  }

  // Cached parseResizeOption(this.resize) — recomputed only when the `resize`
  // attribute actually changes, in attributeChangedCallback below, rather
  // than reparsing the string on every resizeFlags access.
  #resizeFlags = 0;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = /* html */ `
      <style>${styles}</style>
      <div class="panel">

      </div>
    `;
  }

  attributeChangedCallback(name, _oldValue, newValue) {
    if (name === "resize") {
      this.#resizeFlags = parseResizeOption(newValue);
      if (getUnsupportedResizeOptions(this.#resizeFlags)) {
        console.warn(
          '[gb-sprite] dynamic-panel currently only supports resize="LEFT"; other requested edges are ignored for now',
        );
      }
    }
  }

  get resize() {
    return this.getAttribute("resize");
  }

  // The `resize` attribute's current value as a ResizeOption bitmask.
  get resizeFlags() {
    return this.#resizeFlags;
  }
}
customElements.define("dynamic-panel", DynamicPanel);
