import styles from "./FrameGallery.css?inline";
import { frameStore } from "../../state/frameStore.js";

// Renders a <frame-preview> per frame in frameStore, letting each one pin
// itself to its frame via the frame-index attribute (frame-preview handles
// its own re-rendering off frameStore's "change" event, so this component
// only needs to manage which item is marked selected).
class FrameGallery extends HTMLElement {
  #frameElements;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = /* html */ `
      <style>${styles}</style>
      <h2>Frames</h2>
      <div class="gallery">
        ${frameStore.frames
          .map(
            (_frame, index) => /* html */ `
          <div class="frame" data-index="${index}">
            <frame-preview frame-index="${index}"></frame-preview>
            <div class="overlay"></div>
          </div>
          `,
          )
          .join("")}
      </div>
    `;

    this.#frameElements = shadow.querySelectorAll(".frame");
    this.#frameElements.forEach((frameEl) => {
      frameEl.addEventListener("click", () => {
        frameStore.setSelectedFrameIndex(Number(frameEl.dataset.index));
      });
    });
  }

  connectedCallback() {
    frameStore.addEventListener("change", this.#onFrameStoreChange);
    this.#onFrameStoreChange();
  }

  disconnectedCallback() {
    frameStore.removeEventListener("change", this.#onFrameStoreChange);
  }

  #onFrameStoreChange = () => {
    this.#frameElements.forEach((frameEl) => {
      frameEl.classList.toggle(
        "selected",
        Number(frameEl.dataset.index) === frameStore.selectedFrameIndex,
      );
    });
  };
}
customElements.define("frame-gallery", FrameGallery);
