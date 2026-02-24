import type { ReactNode } from "react";
import { Island } from "../Island";
import { Sidebar, type SidebarProps } from "../../client/components/Sidebar";
import { TOC, type TOCProps } from "../../client/components/TOC";
import { Nav } from "../components/Nav";
import type { FullConfig } from "../types";

interface DocsLayoutProps {
  sidebar: SidebarProps;
  toc: TOCProps;
  config: FullConfig;
  currentVersion: string;
  children: ReactNode;
}

export function DocsLayout({
  sidebar,
  toc,
  config,
  currentVersion,
  children,
}: DocsLayoutProps) {
  return (
    <>
      <Nav
        config={config}
        showVersionPicker
        currentVersion={currentVersion}
      />
      <div className="flex max-w-[90rem] mx-auto">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 hidden lg:block sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-4">
          <Island name="Sidebar" component={Sidebar} props={sidebar} />
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 px-6 py-8 max-w-none">
          <article className="prose prose-slate dark:prose-invert max-w-3xl mx-auto">
            {children}
          </article>
        </main>

        {/* Table of Contents */}
        <aside className="w-56 shrink-0 hidden xl:block sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-4">
          <Island name="TOC" component={TOC} props={toc} />
        </aside>
      </div>
    </>
  );
}
