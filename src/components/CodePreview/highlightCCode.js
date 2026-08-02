const TOKEN_PATTERN = /(?<keyword>\bunsigned\b|\bchar\b)|(?<number>0x[0-9A-Fa-f]+)|(?<punctuation>[{}[\];,=])/g;

// Tokenizes the narrow C subset generateTilesCode produces and returns a
// DocumentFragment of <span>/text nodes rather than an HTML string, so
// arbitrary text (e.g. the user-controlled tileset name) is never parsed as markup.
export function highlightCCode(code) {
  const fragment = document.createDocumentFragment();
  let lastIndex = 0;

  for (const match of code.matchAll(TOKEN_PATTERN)) {
    if (match.index > lastIndex) {
      fragment.appendChild(document.createTextNode(code.slice(lastIndex, match.index)));
    }

    const [tokenType] = Object.entries(match.groups).find(([, value]) => value !== undefined);
    const span = document.createElement("span");
    span.className = `token-${tokenType}`;
    span.textContent = match[0];
    fragment.appendChild(span);

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < code.length) {
    fragment.appendChild(document.createTextNode(code.slice(lastIndex)));
  }

  return fragment;
}
