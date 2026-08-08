import styles from "./ToggleSwitch.css?inline";

// A boolean on/off control, built on a native <button role="switch"> so
// keyboard (Space/Enter) and screen-reader semantics come for free. State is
// reflected on the `checked` attribute (so CSS and markup can both read it),
// and toggling dispatches a bubbling, composed "change" event with
// `detail: { checked }` for parent code to listen for.
//
// A plain custom element isn't natively "labelable", so wrapping one in an
// external <label> doesn't reliably forward clicks/focus to it. Instead, an
// optional `label` attribute renders the text inside the shadow DOM, wrapped
// in a real <label> around the <button> — native label-click-to-activate
// semantics then apply with no cross-boundary trickery needed. It's read
// once at connect time rather than observed, since it isn't expected to change.
class ToggleSwitch extends HTMLElement {
  static observedAttributes = ["checked"];

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = /* html */ `
      <style>${styles}</style>
      <label part="label">
        <span class="label-text"></span>
        <button type="button" role="switch" part="switch">
          <span class="thumb"></span>
        </button>
      </label>
    `;
    this.button = shadow.querySelector("button");
    this.labelText = shadow.querySelector(".label-text");
    this.button.addEventListener("click", () => {
      this.checked = !this.checked;
      this.dispatchEvent(
        new CustomEvent("change", {
          detail: { checked: this.checked },
          bubbles: true,
          composed: true,
        }),
      );
    });
  }

  connectedCallback() {
    const label = this.getAttribute("label") ?? "";
    this.labelText.textContent = label;
    this.labelText.hidden = label === "";
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  get checked() {
    return this.hasAttribute("checked");
  }

  set checked(value) {
    this.toggleAttribute("checked", Boolean(value));
  }

  render() {
    if (!this.button) return;
    this.button.setAttribute("aria-checked", String(this.checked));
    this.button.classList.toggle("checked", this.checked);
  }
}
customElements.define("toggle-switch", ToggleSwitch);
