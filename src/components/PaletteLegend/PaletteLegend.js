import styles from "./PaletteLegend.css?inline";
import { paletteStore } from "../../state/paletteStore.js";

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
          <div class="swatch" data-index="${index}">
            <div class="swatch-color" style="background-color: var(--gbs-palette-${index})"></div>
            <span>${label} [${index}]</span>
          </div>
        `,
        ).join("")}
      </div>
    `;

    const swatches = shadow.querySelectorAll(".swatch");
    const updateSelected = () => {
      swatches.forEach((swatch) => {
        swatch.classList.toggle(
          "selected",
          Number(swatch.dataset.index) === paletteStore.selectedColorIndex,
        );
      });
    };

    swatches.forEach((swatch) => {
      swatch.addEventListener("click", () => {
        paletteStore.setSelectedColorIndex(Number(swatch.dataset.index));
      });
    });
    paletteStore.addEventListener("change", updateSelected);
    updateSelected();
  }
}
customElements.define("palette-legend", PaletteLegend);
