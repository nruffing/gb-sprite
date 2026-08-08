import styles from "./TabPanel.css?inline";
import "../SvgIcon/SvgIcon.js";

// Tabs are driven by light-DOM children: each direct child is one tab, labeled
// via its `tab-label` attribute (and optionally a leading icon via `tab-icon`,
// a key into SvgIcon's ICONS registry). Visibility is toggled with `hidden` on
// the child itself rather than named <slot>s, since the set of children is
// dynamic. The `data-default-tab` attribute (matched against a child's
// `tab-label`) selects which tab is shown on load; it falls back to the first tab.
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

      const iconName = panel.getAttribute("tab-icon");
      if (iconName) {
        const icon = document.createElement("svg-icon");
        icon.setAttribute("name", iconName);
        button.appendChild(icon);
      }
      button.appendChild(
        document.createTextNode(
          panel.getAttribute("tab-label") ?? `Tab ${index + 1}`,
        ),
      );

      button.addEventListener("click", () => this.selectIndex(index));
      tabsContainer.appendChild(button);
      return button;
    });

    this.panels = panels;

    const defaultTab = this.dataset.defaultTab;
    const defaultIndex = panels.findIndex(
      (panel) => panel.getAttribute("tab-label") === defaultTab,
    );
    this.selectIndex(defaultIndex === -1 ? 0 : defaultIndex);
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
