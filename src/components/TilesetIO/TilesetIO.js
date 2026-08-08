import styles from "./TilesetIO.css?inline";
import { frameStore } from "../../state/frameStore.js";
import { PALETTE_SIZE } from "../../state/paletteStore.js";
import { generateSpritePng } from "./generateSpritePng.js";

// e.g. "tileset-v1-2026-08-07T12-34-56Z.json"
function buildExportFilename(version, extension) {
  const timestamp = new Date()
    .toISOString()
    .replace(/\.\d{3}Z$/, "Z") // truncate to whole seconds
    .replace(/:/g, "-"); // colons aren't valid in filenames on some OSes
  return `tileset-v${version}-${timestamp}.${extension}`;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// Saves/loads the current tileset as JSON, round-tripping the exact shape
// frameStore.toJSON()/loadTiles() use, or exports it as a PNG. Neither the
// PNG nor the GBDK C source CodePreview generates round-trip back in — both
// are one-way exports for use elsewhere.
class TilesetIO extends HTMLElement {
  #fileInput;
  #statusElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = /* html */ `
      <style>${styles}</style>
      <div class="io">
        <button type="button" name="exportTileset">Export tileset</button>
        <label class="file-button">
          Import tileset
          <input type="file" accept="application/json" hidden />
        </label>
        <div></div>
        <button type="button" name="exportPng">Export PNG</button>
      </div>
      <p class="status" role="status"></p>
    `;

    this.#fileInput = shadow.querySelector("input");
    this.#statusElement = shadow.querySelector(".status");

    shadow
      .querySelector('[name="exportTileset"]')
      .addEventListener("click", () => this.#exportTileset());
    shadow
      .querySelector('[name="exportPng"]')
      .addEventListener("click", () => this.#exportPng());
    this.#fileInput.addEventListener("change", () => this.#importTileset());
  }

  #exportTileset() {
    const payload = frameStore.toJSON();
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    downloadBlob(blob, buildExportFilename(payload.version, "json"));
  }

  #exportPng() {
    const payload = frameStore.toJSON();
    const { tiles, mapWidth } = frameStore.selectedFrame;
    const pngBytes = generateSpritePng(tiles, mapWidth, PALETTE_SIZE);
    const blob = new Blob([pngBytes], { type: "image/png" });
    downloadBlob(blob, buildExportFilename(payload.version, "png"));
  }

  async #importTileset() {
    const [file] = this.#fileInput.files;
    this.#fileInput.value = "";
    if (!file) return;

    let data;
    try {
      data = JSON.parse(await file.text());
    } catch {
      this.#setStatus(`Couldn't parse "${file.name}" as JSON.`);
      return;
    }

    if (frameStore.loadTiles(data)) {
      this.#setStatus(`Loaded ${file.name}.`);
    } else {
      this.#setStatus(`"${file.name}" isn't a valid tileset file.`);
    }
  }

  #setStatus(message) {
    this.#statusElement.textContent = message;
  }
}
customElements.define("tileset-io", TilesetIO);
