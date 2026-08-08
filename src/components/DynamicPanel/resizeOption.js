// Which edge(s) of the panel get a drag handle. Bit flags so multiple edges
// can be combined, e.g. `ResizeOption.LEFT | ResizeOption.TOP`.
export const ResizeOption = Object.freeze({
  LEFT: 1 << 0,
  TOP: 1 << 1,
  RIGHT: 1 << 2,
  BOTTOM: 1 << 3,
});

// Parses the `resize` attribute's human-readable form (e.g. "LEFT | TOP")
// into a ResizeOption bitmask. Unrecognized tokens are warned about and
// skipped; a missing/empty value parses to 0 (no drag handles).
export function parseResizeOption(value) {
  if (!value) return 0;

  return value.split("|").reduce((flags, token) => {
    const flag = ResizeOption[token.trim().toUpperCase()];
    if (flag === undefined) {
      console.warn(`[gb-sprite] unrecognized resize option "${token}"`);
      return flags;
    }
    return flags | flag;
  }, 0);
}
