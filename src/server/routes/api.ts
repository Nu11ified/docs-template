import { Elysia, t } from "elysia";
import { search, loadSearchIndex } from "../search";
import { loadConfig } from "../config";

export const apiRoutes = new Elysia().get(
  "/api/search",
  async ({ query }) => {
    const config = loadConfig();
    const version = query.v || config.docs.defaultVersion;
    await loadSearchIndex(version);
    return { results: search(version, query.q || "") };
  },
  {
    query: t.Object({
      q: t.Optional(t.String()),
      v: t.Optional(t.String()),
    }),
  },
);
