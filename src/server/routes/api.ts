import { Elysia } from "elysia";

export const apiRoutes = new Elysia()
  .get("/api/search", ({ query }) => {
    const q = query.q;
    const v = query.v;
    return { results: [] };
  });
