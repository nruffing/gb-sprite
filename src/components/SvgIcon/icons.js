// Registry of icons available to <svg-icon name="...">.
// Sourced from Primer Octicons (https://primer.style/octicons) unless noted otherwise.
export const ICONS = {
  add: {
    viewBox: "0 0 16 16",
    paths: [
      "M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2Z",
    ],
  },
  copy: {
    viewBox: "0 0 16 16",
    paths: [
      "M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z",
      "M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z",
    ],
  },
  code: {
    viewBox: "0 0 16 16",
    paths: [
      "m11.28 3.22 4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734L13.94 8l-3.72-3.72a.749.749 0 0 1 .326-1.275.749.749 0 0 1 .734.215Zm-6.56 0a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L2.06 8l3.72 3.72a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L.47 8.53a.75.75 0 0 1 0-1.06Z",
    ],
  },
  // Octicons has no literal "save"/floppy-disk glyph — this is their
  // download-16, used here to represent exporting a file to disk.
  save: {
    viewBox: "0 0 16 16",
    paths: [
      "M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14Z",
      "M7.25 7.689V2a.75.75 0 0 1 1.5 0v5.689l1.97-1.969a.749.749 0 1 1 1.06 1.06l-3.25 3.25a.749.749 0 0 1-1.06 0L4.22 6.78a.749.749 0 1 1 1.06-1.06l1.97 1.969Z",
    ],
  },
  // Custom (not from Octicons): a gapless 3x3 grid of equal-size cells, a
  // few filled in (not the center, and deliberately not symmetric), echoing
  // tile-gallery's row of tile-preview thumbnails.
  grid: {
    viewBox: "0 0 15 15",
    paths: [
      // Filled cells: top-left, top-middle, right-middle.
      "M0 0H5V5H0ZM5 0H10V5H5ZM10 5H15V10H10Z",
      // The other six cells, drawn as hollow squares (outer square minus
      // an inner square of opposite winding, so it renders as a border).
      "M10 0H15V5H10ZM11 1V4H14V1ZM0 5H5V10H0ZM1 6V9H4V6ZM5 5H10V10H5ZM6 6V9H9V6ZM0 10H5V15H0ZM1 11V14H4V11ZM5 10H10V15H5ZM6 11V14H9V11ZM10 10H15V15H10ZM11 11V14H14V11Z",
    ],
  },
};
