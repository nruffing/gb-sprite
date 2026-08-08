import { toHexByte } from "./hexUtils.js";

// Generates the tile-index "map" array describing how tiles are laid out
// spatially (mapWidth tiles per row), mirroring what Game Boy Tile Tool
// exports alongside the raw tile bitmap data.
export function generateMapCode(tilesetName, tileCount, mapWidth) {
  const lines = [];
  for (let start = 0; start < tileCount; start += mapWidth) {
    const rowIndices = Array.from(
      { length: Math.min(mapWidth, tileCount - start) },
      (_, i) => start + i,
    );
    lines.push(rowIndices.map(toHexByte).join(",") + ",");
  }

  return `unsigned char ${tilesetName}Map[] =\n{\n    ${lines.join("\n    ")}\n};`;
}
