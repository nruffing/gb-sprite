import styles from "./TilesetIO.css?inline";
import { tileStore } from "../../state/tileStore.js";

// e.g. "tileset-v1-2026-08-07T12-34-56Z.json"
function buildExportFilename(version) {
  const timestamp = new Date()
    .toISOString()
    .replace(/\.\d{3}Z$/, "Z") // truncate to whole seconds
    .replace(/:/g, "-"); // colons aren't valid in filenames on some OSes
  return `tileset-v${version}-${timestamp}.json`;
}

// Saves/loads the current tileset as JSON, round-tripping the exact shape
// tileStore.toJSON()/loadTiles() use — not the GBDK C source CodePreview
// generates, which is a one-way export for pasting elsewhere.
class TilesetIO extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = /* html */ `
      <style>${styles}</style>
      <div class="io">
        <button type="button">Export tileset</button>
        <label class="file-button">
          Import tileset
          <input type="file" accept="application/json" hidden />
        </label>
      </div>
      <p class="status" role="status"></p>
    `;

    this.fileInput = shadow.querySelector("input");
    this.statusElement = shadow.querySelector(".status");

    shadow
      .querySelector("button")
      .addEventListener("click", () => this.#exportTileset());
    this.fileInput.addEventListener("change", () => this.#importTileset());
  }

  #exportTileset() {
    const payload = tileStore.toJSON();
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = buildExportFilename(payload.version);
    link.click();
    URL.revokeObjectURL(url);
  }

  async #importTileset() {
    const [file] = this.fileInput.files;
    this.fileInput.value = "";
    if (!file) return;

    let data;
    try {
      data = JSON.parse(await file.text());
    } catch {
      this.#setStatus(`Couldn't parse "${file.name}" as JSON.`);
      return;
    }

    if (tileStore.loadTiles(data)) {
      this.#setStatus(`Loaded ${file.name}.`);
    } else {
      this.#setStatus(`"${file.name}" isn't a valid tileset file.`);
    }
  }

  #setStatus(message) {
    this.statusElement.textContent = message;
  }
}
customElements.define("tileset-io", TilesetIO);
