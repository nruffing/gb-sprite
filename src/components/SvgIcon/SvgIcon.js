import styles from "./SvgIcon.css?inline";
import { ICONS } from "./icons.js";

const SVG_NS = "http://www.w3.org/2000/svg";

class SvgIcon extends HTMLElement {
  static get observedAttributes() {
    return ["name"];
  }

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.shadow.innerHTML = /* html */ `<style>${styles}</style>`;
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    this.shadow.querySelector("svg")?.remove();

    const icon = ICONS[this.getAttribute("name")];
    if (!icon) return;

    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", icon.viewBox);
    svg.setAttribute("aria-hidden", "true");

    for (const d of icon.paths) {
      const path = document.createElementNS(SVG_NS, "path");
      path.setAttribute("d", d);
      path.setAttribute("fill", "currentColor");
      svg.appendChild(path);
    }

    this.shadow.appendChild(svg);
  }
}
customElements.define("svg-icon", SvgIcon);
