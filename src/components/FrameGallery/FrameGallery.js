import styles from "./FrameGallery.css?inline";
import { frameStore } from "../../state/frameStore";

class FrameGallery extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = /* html */ `
        <style>${styles}</style>
        <div class="gallery">
        </div>
      `;
  }
}
customElements.define("frame-gallery", FrameGallery);
