import styles from "./FrameGallery.css?inline";
import {
  frameStore,
  INITIAL_TILE_COUNT,
  MAP_WIDTH,
} from "../../state/frameStore.js";
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
        <div class="gallery" style="--map-width: ${MAP_WIDTH}; --frame-rows: ${INITIAL_TILE_COUNT / MAP_WIDTH}"></div>
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

    // Scrolls along with the frames above it (it's just the last item in
    // .gallery), rather than being pinned like the corner add-frame button.
    // Sized in FrameGallery.css via the same calc() the grid columns use —
    // no DOM measurement needed, since a frame's rendered size is fully
    // knowable ahead of time from --map-width/--frame-rows (set once above)
    // and the --tile-pixel-size/--frame-preview-tile-scale tokens in style.css.
    this.#galleryElement.innerHTML = /* html */ `
      ${frameItems}
      <div class="frame-placeholder">
        <p>Add another frame</p>
        <button type="button" class="icon-button" aria-label="Add frame" title="Add frame">
          <svg-icon name="add"></svg-icon>
        </button>
      </div>
    `;

    this.#galleryElement.querySelectorAll(".frame").forEach((frameEl) => {
      frameEl.addEventListener("click", () => {
        frameStore.setSelectedFrameIndex(Number(frameEl.dataset.index));
      });
    });

    this.#galleryElement
      .querySelector(".frame-placeholder button")
      .addEventListener("click", () => frameStore.addFrame());
  };
}
customElements.define("frame-gallery", FrameGallery);
