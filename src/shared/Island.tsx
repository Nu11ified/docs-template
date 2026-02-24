import type { ComponentType } from "react";

// ---------------------------------------------------------------------------
// IslandProps — describes a client-hydrated "island" component.
// ---------------------------------------------------------------------------

interface IslandProps {
  name: string;
  component: ComponentType<any>;
  props: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Island — renders the component on the server (for SEO / initial paint) and
// wraps it with data attributes so the client hydration script can find it,
// resolve the correct component from the registry, and call hydrateRoot.
// ---------------------------------------------------------------------------

export function Island({ name, component: Component, props }: IslandProps) {
  return (
    <div data-island={name} data-props={JSON.stringify(props)}>
      <Component {...props} />
    </div>
  );
}
