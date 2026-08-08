import styles from "./DynamicPanel.css?inline";

class DynamicPanel extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = /* html */ `
      <style>${styles}</style>
      <div class="panel">

      </div>
    `;
  }
}
customElements.define("dynamic-panel", DynamicPanel);
