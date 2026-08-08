import { toHexByte } from "./hexUtils.js";

const BYTES_PER_LINE = 16;

function tileRowToHexes(rowPixels) {
  const lsbBits = rowPixels.map((pixel) =>
    pixel === 1 || pixel === 3 ? 1 : 0,
  );
  const msbBits = rowPixels.map((pixel) =>
    pixel === 2 || pixel === 3 ? 1 : 0,
  );
  return [
    toHexByte(parseInt(lsbBits.join(""), 2)),
    toHexByte(parseInt(msbBits.join(""), 2)),
  ];
}

export function generateTilesCode(tilesetName, tiles) {
  const hexes = [];
  for (const pixels of tiles) {
    for (let row = 0; row < 8; row++) {
      hexes.push(...tileRowToHexes(pixels.slice(row * 8, row * 8 + 8)));
    }
  }

  let output = `unsigned char ${tilesetName}Tiles[] =\n{\n    `;
  hexes.forEach((hex, i) => {
    if (i % BYTES_PER_LINE === 0 && i !== 0) output += "\n    ";
    output += hex + ",";
  });
  output += "\n};";

  return output;
}
