import styles from "./PaletteLegend.css?inline";

const PALETTE = [
  { index: 0, label: "WHITE" },
  { index: 1, label: "LTGREY" },
  { index: 2, label: "DKGREY" },
  { index: 3, label: "BLACK" },
];

class PaletteLegend extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = /* html */ `
      <style>${styles}</style>
      <div class="legend">
        ${PALETTE.map(
          ({ index, label }) => /* html */ `
          <div class="swatch">
            <div class="swatch-color" style="background-color: var(--gbs-palette-${index})"></div>
            <span>${label} [${index}]</span>
          </div>
        `,
        ).join("")}
      </div>
    `;
  }
}
customElements.define("palette-legend", PaletteLegend);
