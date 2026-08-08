// Encodes/decodes an 8x8 tile's pixel color indices (each a palette slot,
// 0-3) to/from the `pixels` attribute TilePreview reads — a flat,
// comma-separated, row-major list, e.g. "0,0,1,2,3,...". Keeps TilePreview
// itself decoupled from frameStore: callers (TileGallery, FramePreview) read
// frameStore.selectedFrame.tiles[i].pixels and pass the encoded string down
// as an attribute.
export function encodePixels(pixels) {
  return pixels.join(",");
}

// Returns null (render nothing) for a missing/empty value, rather than
// throwing, so an unset `pixels` attribute is a valid "blank tile" state.
export function decodePixels(value) {
  if (!value) return null;
  return value.split(",").map(Number);
}
