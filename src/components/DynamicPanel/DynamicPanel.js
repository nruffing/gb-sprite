import styles from "./DynamicPanel.css?inline";
import { ResizeOption, parseResizeOption } from "./resizeOption.js";

const MIN_PANEL_SIZE = 150;
const MAX_PANEL_SIZE = 800;

// Maps each ResizeOption edge to the CSS dimension its handle drags and
// which pointer-movement direction grows the panel along that axis. LEFT/TOP
// are the far edge from the panel's anchored side, so dragging *toward* the
// anchor (a negative delta) grows the panel — hence sign -1. RIGHT/BOTTOM
// grow as the pointer moves away from the anchor, sign +1.
const EDGE_CONFIG = {
  [ResizeOption.LEFT]: { className: "left", axis: "width", sign: -1 },
  [ResizeOption.TOP]: { className: "top", axis: "height", sign: -1 },
  [ResizeOption.RIGHT]: { className: "right", axis: "width", sign: 1 },
  [ResizeOption.BOTTOM]: { className: "bottom", axis: "height", sign: 1 },
};

class DynamicPanel extends HTMLElement {
  static get observedAttributes() {
    return ["resize"];
  }

  #resizeFlags = 0;
  #panel;
  // ResizeOption flag -> its handle <div>, so #render can look each one up
  // by flag rather than re-querying the DOM.
  #handles = new Map();
  // Set for the duration of a drag; null otherwise.
  #activeDrag = null;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = /* html */ `
      <style>${styles}</style>
      <div class="panel">
        ${Object.values(EDGE_CONFIG)
          .map(
            ({ className }) => /* html */ `
          <div class="resize-handle resize-handle-${className}"></div>
          `,
          )
          .join("")}
          <slot></slot>
      </div>
    `;

    this.#panel = shadow.querySelector("div.panel");
    for (const [flag, edgeConfig] of Object.entries(EDGE_CONFIG)) {
      const handleEl = shadow.querySelector(
        `.resize-handle-${edgeConfig.className}`,
      );
      this.#handles.set(Number(flag), handleEl);
      handleEl.addEventListener("pointerdown", (event) =>
        this.#startDrag(event, handleEl, edgeConfig),
      );
    }
  }

  disconnectedCallback() {
    // In case the panel is removed from the DOM mid-drag, still detach the
    // pointermove/pointerup/pointercancel listeners #startDrag attached.
    this.#endDrag();
  }

  attributeChangedCallback(name, _oldValue, newValue) {
    if (name === "resize") {
      const prevFlags = this.#resizeFlags;
      this.#resizeFlags = parseResizeOption(newValue);
      if (this.#resizeFlags !== prevFlags) {
        this.#render();
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

  // Reflects the resize flags onto the panel as `resize-<edge>` classes (e.g.
  // `resize-left`), so DynamicPanel.css can show/position each edge's handle
  // and border independently.
  #render = () => {
    for (const [flag, { className }] of Object.entries(EDGE_CONFIG)) {
      this.#panel.classList.toggle(
        `resize-${className}`,
        (this.#resizeFlags & Number(flag)) !== 0,
      );
    }
  };

  #startDrag(event, handleEl, edgeConfig) {
    event.preventDefault();
    // Redirects subsequent pointer events to handleEl regardless of where
    // the cursor actually ends up, so a fast/thin drag doesn't lose the handle.
    handleEl.setPointerCapture(event.pointerId);

    const rect = this.getBoundingClientRect();
    this.#activeDrag = {
      handleEl,
      edgeConfig,
      pointerId: event.pointerId,
      startPos: edgeConfig.axis === "width" ? event.clientX : event.clientY,
      startSize: edgeConfig.axis === "width" ? rect.width : rect.height,
    };

    handleEl.addEventListener("pointermove", this.#onDragMove);
    handleEl.addEventListener("pointerup", this.#onDragEnd);
    handleEl.addEventListener("pointercancel", this.#onDragEnd);
    handleEl.classList.add("dragging");
  }

  #onDragMove = (event) => {
    if (!this.#activeDrag) return;
    const { edgeConfig, startPos, startSize } = this.#activeDrag;
    const pos = edgeConfig.axis === "width" ? event.clientX : event.clientY;
    const delta = (pos - startPos) * edgeConfig.sign;
    const size = Math.min(
      MAX_PANEL_SIZE,
      Math.max(MIN_PANEL_SIZE, startSize + delta),
    );
    this.style[edgeConfig.axis] = `${size}px`;
  };

  #onDragEnd = (event) => {
    if (!this.#activeDrag || event.pointerId !== this.#activeDrag.pointerId) {
      return;
    }
    this.#endDrag();
  };

  #endDrag() {
    if (!this.#activeDrag) return;
    const { handleEl, pointerId } = this.#activeDrag;
    if (handleEl.hasPointerCapture(pointerId)) {
      handleEl.releasePointerCapture(pointerId);
    }
    handleEl.removeEventListener("pointermove", this.#onDragMove);
    handleEl.removeEventListener("pointerup", this.#onDragEnd);
    handleEl.removeEventListener("pointercancel", this.#onDragEnd);
    handleEl.classList.remove("dragging");
    this.#activeDrag = null;
  }
}
customElements.define("dynamic-panel", DynamicPanel);
