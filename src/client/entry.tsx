import { registerIsland, hydrateIslands } from "./islands";
import { Search } from "./components/Search";
import { Sidebar } from "./components/Sidebar";
import { TOC } from "./components/TOC";
import { ThemeToggle } from "./components/ThemeToggle";

registerIsland("Search", Search);
registerIsland("Sidebar", Sidebar);
registerIsland("TOC", TOC);
registerIsland("ThemeToggle", ThemeToggle);

hydrateIslands();
