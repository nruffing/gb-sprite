import styles from "./TabPanel.css?inline";

// Tabs are driven by light-DOM children: each direct child is one tab, labeled
// via its `tab-label` attribute. Visibility is toggled with `hidden` on the
// child itself rather than named <slot>s, since the set of children is dynamic.
class TabPanel extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = /* html */ `
      <style>${styles}</style>
      <div class="tabs"></div>
      <slot></slot>
    `;
  }

  connectedCallback() {
    const tabsContainer = this.shadowRoot.querySelector(".tabs");
    const panels = Array.from(this.children);

    this.tabButtons = panels.map((panel, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent =
        panel.getAttribute("tab-label") ?? `Tab ${index + 1}`;
      button.addEventListener("click", () => this.selectIndex(index));
      tabsContainer.appendChild(button);
      return button;
    });

    this.panels = panels;
    this.selectIndex(0);
  }

  selectIndex(index) {
    this.panels.forEach((panel, i) => {
      panel.hidden = i !== index;
    });
    this.tabButtons.forEach((button, i) => {
      button.classList.toggle("selected", i === index);
    });
  }
}
customElements.define("tab-panel", TabPanel);
