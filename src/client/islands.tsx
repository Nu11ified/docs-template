import { hydrateRoot } from "react-dom/client";
import type { ComponentType } from "react";

// ---------------------------------------------------------------------------
// Island hydration registry
// ---------------------------------------------------------------------------

const registry: Record<string, ComponentType<Record<string, unknown>>> = {};

/**
 * Register a component so it can be hydrated on the client when an element
 * with a matching `data-island` attribute is found in the DOM.
 */
export function registerIsland(name: string, component: ComponentType<Record<string, unknown>>) {
  registry[name] = component;
}

/**
 * Walk the DOM looking for `[data-island]` elements, resolve each one against
 * the registry, deserialise its props, and call `hydrateRoot` to make it
 * interactive on the client.
 */
export function hydrateIslands() {
  document.querySelectorAll("[data-island]").forEach((el) => {
    const name = el.getAttribute("data-island")!;
    const props = JSON.parse(el.getAttribute("data-props") || "{}");
    const Component = registry[name];
    if (Component) {
      hydrateRoot(el, <Component {...props} />);
    }
  });
}
