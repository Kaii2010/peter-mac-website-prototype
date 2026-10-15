(function () {
  "use strict";

  const body = document.body;
  const status = document.querySelector("[data-accessibility-status]");
  const textSizeButton = document.querySelector('[data-accessibility="text-size"]');
  const contrastButton = document.querySelector('[data-accessibility="contrast"]');
  const readButton = document.querySelector('[data-accessibility="read-aloud"]');
  const menuButton = document.querySelector(".menu-toggle");
  const primaryNav = document.querySelector(".primary-nav");
  const submenuButtons = Array.from(document.querySelectorAll(".submenu-toggle"));
  const storage = {
    get(key) {
      try { return window.localStorage.getItem(key); } catch (_) { return null; }
    },
    set(key, value) {
      try { window.localStorage.setItem(key, value); } catch (_) { /* Preferences remain active for this visit. */ }
    }
  };

  function announce(message) {
    if (!status) return;
    status.textContent = "";
    window.setTimeout(() => { status.textContent = message; }, 30);
  }

  const textSizes = ["default", "large", "largest"];
  const textLabels = { default: "Default", large: "Large", largest: "Largest" };

  function applyTextSize(size, shouldAnnounce) {
    const validSize = textSizes.includes(size) ? size : "default";
    body.classList.toggle("text-large", validSize === "large");
    body.classList.toggle("text-largest", validSize === "largest");
    if (textSizeButton) {
      const label = textSizeButton.querySelector("[data-text-size-label]");
      if (label) label.textContent = `Text size: ${textLabels[validSize]}`;
      textSizeButton.setAttribute("aria-label", `Change text size. Current size: ${textLabels[validSize]}`);
    }
    storage.set("pm-prototype-text-size", validSize);
    if (shouldAnnounce) announce(`Text size changed to ${textLabels[validSize]}.`);
  }

  applyTextSize(storage.get("pm-prototype-text-size") || "default", false);
  if (textSizeButton) {
    textSizeButton.addEventListener("click", () => {
      const current = storage.get("pm-prototype-text-size") || "default";
      const next = textSizes[(textSizes.indexOf(current) + 1) % textSizes.length];
      applyTextSize(next, true);
    });
  }

  function applyContrast(enabled, shouldAnnounce) {
    body.classList.toggle("high-contrast", enabled);
    if (contrastButton) contrastButton.setAttribute("aria-pressed", String(enabled));
    storage.set("pm-prototype-high-contrast", enabled ? "true" : "false");
    if (shouldAnnounce) announce(`High contrast ${enabled ? "on" : "off"}.`);
  }

  applyContrast(storage.get("pm-prototype-high-contrast") === "true", false);
  if (contrastButton) {
    contrastButton.addEventListener("click", () => applyContrast(!body.classList.contains("high-contrast"), true));
  }

  let reading = false;
  function stopReading(shouldAnnounce) {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    reading = false;
    body.classList.remove("reading-active");
    if (readButton) {
      readButton.setAttribute("aria-pressed", "false");
      const label = readButton.querySelector("[data-read-label]");
      if (label) label.textContent = "Read aloud";
    }
    if (shouldAnnounce) announce("Read aloud stopped.");
  }

  if (readButton) {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      readButton.disabled = true;
      readButton.title = "Read aloud is not supported by this browser";
    } else {
      readButton.addEventListener("click", () => {
        if (reading) { stopReading(true); return; }
        const main = document.querySelector("main");
        if (!main) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(main.innerText.replace(/\s+/g, " ").trim());
        utterance.lang = "en-AU";
        utterance.rate = 0.95;
        utterance.onend = () => stopReading(false);
        utterance.onerror = () => { stopReading(false); announce("Read aloud could not continue."); };
        reading = true;
        body.classList.add("reading-active");
        readButton.setAttribute("aria-pressed", "true");
        const label = readButton.querySelector("[data-read-label]");
        if (label) label.textContent = "Stop reading";
        announce("Read aloud started.");
        window.speechSynthesis.speak(utterance);
      });
    }
  }

  function closeSubmenus(exceptButton) {
    submenuButtons.forEach((button) => {
      if (button === exceptButton) return;
      const menu = document.getElementById(button.getAttribute("aria-controls"));
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-label", "Show About us menu");
      if (menu) menu.hidden = true;
    });
  }

  submenuButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const menu = document.getElementById(button.getAttribute("aria-controls"));
      if (!menu) return;
      const opening = menu.hidden;
      closeSubmenus(opening ? button : null);
      menu.hidden = !opening;
      button.setAttribute("aria-expanded", String(opening));
      button.setAttribute("aria-label", `${opening ? "Hide" : "Show"} About us menu`);
    });
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".nav-item")) closeSubmenus();
  });

  if (menuButton && primaryNav) {
    function closeMenu() {
      primaryNav.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
      closeSubmenus();
    }
    menuButton.addEventListener("click", () => {
      const opening = !primaryNav.classList.contains("is-open");
      primaryNav.classList.toggle("is-open", opening);
      menuButton.setAttribute("aria-expanded", String(opening));
    });
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      const openSubmenuButton = submenuButtons.find((button) => button.getAttribute("aria-expanded") === "true");
      if (openSubmenuButton) {
        closeSubmenus();
        openSubmenuButton.focus();
        return;
      }
      if (!primaryNav.classList.contains("is-open")) return;
      closeMenu();
      menuButton.focus();
    });
    window.matchMedia("(min-width: 861px)").addEventListener("change", (event) => { if (event.matches) closeMenu(); });
  }

  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  if (tabs.length) {
    function activateTab(tab) {
      tabs.forEach((item) => {
        const selected = item === tab;
        item.setAttribute("aria-selected", String(selected));
        item.tabIndex = selected ? 0 : -1;
        const panel = document.getElementById(item.getAttribute("aria-controls"));
        if (panel) panel.hidden = !selected;
      });
    }
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activateTab(tab));
      tab.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        let nextIndex = index;
        if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = tabs.length - 1;
        activateTab(tabs[nextIndex]);
        tabs[nextIndex].focus();
      });
    });
  }

  window.addEventListener("pagehide", () => { if (reading) stopReading(false); });
})();
