import { useState } from "react";

export interface SidebarItem {
  title: string;
  href?: string;
  children?: SidebarItem[];
}

export interface SidebarProps {
  items: SidebarItem[];
  currentPath: string;
  collapsible: boolean;
}

function SidebarLink({
  item,
  currentPath,
  collapsible,
  depth,
}: {
  item: SidebarItem;
  currentPath: string;
  collapsible: boolean;
  depth: number;
}) {
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.href === currentPath;

  // Determine if this folder should be open by default:
  // expand if the current path starts with any child's href
  const isChildActive = hasChildren
    ? item.children!.some(
        (child) =>
          child.href === currentPath ||
          (child.children &&
            child.children.some((gc) => gc.href === currentPath))
      )
    : false;

  const [isOpen, setIsOpen] = useState(!collapsible || isChildActive || isActive);

  if (hasChildren) {
    return (
      <li>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex w-full items-center justify-between rounded-md px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-[var(--site-text)]/5 text-[var(--site-text)]/80`}
          style={{ paddingLeft: `${depth * 12 + 12}px` }}
        >
          <span>{item.title}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        {isOpen && (
          <ul className="mt-0.5">
            {item.children!.map((child, idx) => (
              <SidebarLink
                key={idx}
                item={child}
                currentPath={currentPath}
                collapsible={collapsible}
                depth={depth + 1}
              />
            ))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <li>
      <a
        href={item.href || "#"}
        className={`block rounded-md px-3 py-1.5 text-sm transition-colors ${
          isActive
            ? "bg-[var(--site-primary)]/10 text-[var(--site-primary)] font-medium"
            : "text-[var(--site-text)]/70 hover:bg-[var(--site-text)]/5 hover:text-[var(--site-text)]"
        }`}
        style={{ paddingLeft: `${depth * 12 + 12}px` }}
      >
        {item.title}
      </a>
    </li>
  );
}

export function Sidebar({ items, currentPath, collapsible }: SidebarProps) {
  return (
    <nav aria-label="Documentation sidebar">
      <ul className="space-y-0.5">
        {items.map((item, idx) => (
          <SidebarLink
            key={idx}
            item={item}
            currentPath={currentPath}
            collapsible={collapsible}
            depth={0}
          />
        ))}
      </ul>
    </nav>
  );
}
