// Which edge(s) of the panel a drag handle can attach to. Bit flags so
// multiple edges can be combined, e.g. `ResizeOption.LEFT | ResizeOption.TOP`.
// DynamicPanel only wires up handle rendering for LEFT so far — the other
// edges exist here so parsing/combining is already correct once that lands.
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

// Edges DynamicPanel actually renders/wires a drag handle for today. Update
// this as more ResizeOption edges get implemented.
const SUPPORTED_RESIZE_OPTIONS = ResizeOption.LEFT;

// Returns the subset of a ResizeOption bitmask that DynamicPanel doesn't
// implement yet (0 if every requested edge is supported).
export function getUnsupportedResizeOptions(flags) {
  return flags & ~SUPPORTED_RESIZE_OPTIONS;
}
