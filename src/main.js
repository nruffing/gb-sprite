import "./style.css";
import { paletteStore, PALETTE_SIZE } from "./state/paletteStore.js";

import "./components/SpriteEditorGrid/SpriteEditorGrid.js";
import "./components/PaletteLegend/PaletteLegend.js";
import "./components/CodePreview/CodePreview.js";

const isTextInput = (target) =>
  target instanceof HTMLElement &&
  (target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable);

const colorIndexKeyPattern = new RegExp(
  `^[0-${Math.min(PALETTE_SIZE - 1, 9)}]$`,
);

window.addEventListener("keydown", (event) => {
  if (isTextInput(event.target)) return;

  if (event.key === "`") {
    paletteStore.setSelectedColorIndex(0);
  } else if (colorIndexKeyPattern.test(event.key)) {
    paletteStore.setSelectedColorIndex(Number(event.key));
  }
});
