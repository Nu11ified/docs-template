import { registerIsland, hydrateIslands } from "./islands";
import { Search } from "./components/Search";
import { Sidebar } from "./components/Sidebar";
import { TOC } from "./components/TOC";
import { ThemeToggle } from "./components/ThemeToggle";
import { VersionPicker } from "./components/VersionPicker";
import { initCodeBlocks } from "./components/CodeBlock";

registerIsland("Search", Search);
registerIsland("Sidebar", Sidebar);
registerIsland("TOC", TOC);
registerIsland("ThemeToggle", ThemeToggle);
registerIsland("VersionPicker", VersionPicker);

hydrateIslands();
initCodeBlocks();
