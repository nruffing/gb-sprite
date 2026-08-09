import styles from "./FrameGallery.css?inline";
import { frameStore } from "../../state/frameStore.js";
import "../SvgIcon/SvgIcon.js";

// Renders a <frame-preview> per frame in frameStore, letting each one pin
// itself to its frame via the frame-index attribute (frame-preview handles
// its own re-rendering off frameStore's "change" event, so this component
// only needs to manage the frame list itself and which item is selected).
// Rebuilt in full on every frameStore change, unlike TileGallery's
// fixed-count partial update — frame count isn't fixed, it grows via
// addFrame().
class FrameGallery extends HTMLElement {
  #galleryElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = /* html */ `
      <style>${styles}</style>
      <div class="container">
        <button type="button" class="icon-button add-frame" aria-label="Add frame" title="Add frame">
          <svg-icon name="add"></svg-icon>
        </button>
        <h2>Frames</h2>
        <div class="gallery"></div>
      </div>
    `;

    this.#galleryElement = shadow.querySelector(".gallery");
    shadow
      .querySelector(".add-frame")
      .addEventListener("click", () => frameStore.addFrame());
  }

  connectedCallback() {
    frameStore.addEventListener("change", this.#render);
    this.#render();
  }

  disconnectedCallback() {
    frameStore.removeEventListener("change", this.#render);
  }

  #render = () => {
    const frameItems = frameStore.frames
      .map((_frame, index) => {
        const selected = index === frameStore.selectedFrameIndex;
        return /* html */ `
          <div class="frame${selected ? " selected" : ""}" data-index="${index}">
            <frame-preview frame-index="${index}"></frame-preview>
            <div class="overlay"></div>
          </div>
        `;
      })
      .join("");

    this.#galleryElement.innerHTML = /* html */ `
      ${frameItems}
      <div class="frame-placeholder">
        <p>Add another frame</p>
        <button type="button" class="icon-button" aria-label="Add frame" title="Add frame">
          <svg-icon name="add"></svg-icon>
        </button>
      </div>
    `;

    const frameEls = this.#galleryElement.querySelectorAll(".frame");
    frameEls.forEach((frameEl) => {
      frameEl.addEventListener("click", () => {
        frameStore.setSelectedFrameIndex(Number(frameEl.dataset.index));
      });
    });

    const placeholder =
      this.#galleryElement.querySelector(".frame-placeholder");
    // Matches whatever size a frame actually renders at (driven by
    // FramePreview's tile scale/mapWidth) rather than duplicating that math
    // here — offsetWidth/offsetHeight are border-box measurements, hence
    // .frame-placeholder being box-sizing: border-box too, so they line up
    // exactly.
    if (frameEls.length > 0) {
      // Measure the <frame-preview> itself, not the .frame wrapper around
      // it — .frame is the grid item, and grid items stretch to fill their
      // track by default, so its offsetWidth would reflect however wide the
      // grid *already* decided the column was, not the frame's true
      // intrinsic size. (That circularity is exactly what broke this the
      // first time: with no --frame-width set yet, the very first column
      // fell back to 100%-wide, so the "measured" width came back inflated
      // and got baked into --frame-width for every render after.)
      // frame-preview isn't a grid item — it's a normal, unstretched flex
      // child of .frame — so its own box always reflects its real size.
      const framePreview = frameEls[0].querySelector("frame-preview");
      const frameWidth = framePreview.offsetWidth;
      const frameHeight = framePreview.offsetHeight;
      placeholder.style.width = `${frameWidth}px`;
      placeholder.style.height = `${frameHeight}px`;
      // grid-template-columns: repeat(auto-fill, max-content) can't compute
      // a repeat count from a purely intrinsic size — with nothing fixed to
      // divide the container width by, browsers just fall back to a single
      // column. Feeding the measured frame width in as a minmax() floor
      // gives auto-fill a definite size to work with.
      this.#galleryElement.style.setProperty(
        "--frame-width",
        `${frameWidth}px`,
      );
    }
    placeholder
      .querySelector("button")
      .addEventListener("click", () => frameStore.addFrame());
  };
}
customElements.define("frame-gallery", FrameGallery);
