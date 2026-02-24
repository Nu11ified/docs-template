// ---------------------------------------------------------------------------
// CodeBlock — enhances pre-existing <pre><code> blocks with a copy button.
// This is NOT an island component. It runs once on page load to add
// interactivity to Shiki-highlighted code blocks.
// ---------------------------------------------------------------------------

function createClipboardIcon(): SVGSVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "16");
  svg.setAttribute("height", "16");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");

  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("x", "9");
  rect.setAttribute("y", "9");
  rect.setAttribute("width", "13");
  rect.setAttribute("height", "13");
  rect.setAttribute("rx", "2");
  rect.setAttribute("ry", "2");
  svg.appendChild(rect);

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1");
  svg.appendChild(path);

  return svg;
}

function setButtonToIcon(btn: HTMLButtonElement) {
  while (btn.firstChild) btn.removeChild(btn.firstChild);
  btn.appendChild(createClipboardIcon());
}

function setButtonToText(btn: HTMLButtonElement, text: string) {
  while (btn.firstChild) btn.removeChild(btn.firstChild);
  btn.appendChild(document.createTextNode(text));
}

function createCopyButton(preEl: HTMLPreElement): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.setAttribute("aria-label", "Copy code");
  setButtonToIcon(btn);

  // Styling: absolute top-right, semi-transparent, visible on hover
  Object.assign(btn.style, {
    position: "absolute",
    top: "8px",
    right: "8px",
    padding: "4px 8px",
    border: "none",
    borderRadius: "4px",
    background: "rgba(128, 128, 128, 0.15)",
    color: "inherit",
    cursor: "pointer",
    opacity: "0",
    transition: "opacity 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "12px",
    lineHeight: "1",
    zIndex: "1",
  });

  btn.addEventListener("click", async () => {
    const code = preEl.querySelector("code");
    const text = code ? code.textContent || "" : preEl.textContent || "";

    try {
      await navigator.clipboard.writeText(text);
      setButtonToText(btn, "Copied!");
      setTimeout(() => {
        setButtonToIcon(btn);
      }, 2000);
    } catch {
      setButtonToText(btn, "Failed");
      setTimeout(() => {
        setButtonToIcon(btn);
      }, 2000);
    }
  });

  return btn;
}

export function initCodeBlocks() {
  const preElements = document.querySelectorAll("pre");

  preElements.forEach((pre) => {
    // Only target <pre> elements that contain a <code> child
    const code = pre.querySelector("code");
    if (!code) return;

    // Skip if already enhanced
    if (pre.getAttribute("data-code-block") === "true") return;
    pre.setAttribute("data-code-block", "true");

    // Wrap the <pre> in a relative container if not already wrapped
    let wrapper = pre.parentElement;
    if (!wrapper || !wrapper.style.position || wrapper.style.position !== "relative") {
      wrapper = document.createElement("div");
      wrapper.style.position = "relative";
      pre.parentNode!.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);
    }

    // Create and append the copy button
    const btn = createCopyButton(pre);
    wrapper.appendChild(btn);

    // Show/hide button on hover
    wrapper.addEventListener("mouseenter", () => {
      btn.style.opacity = "1";
    });
    wrapper.addEventListener("mouseleave", () => {
      btn.style.opacity = "0";
    });
  });
}
