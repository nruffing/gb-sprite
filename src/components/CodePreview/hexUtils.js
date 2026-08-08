export function toHexByte(value) {
  const hex = value.toString(16).toUpperCase();
  return `0x${hex.length === 1 ? "0" : ""}${hex}`;
}
