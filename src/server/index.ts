import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import { loadConfig, clearConfigCache } from "./config";
import { landingRoutes } from "./routes/landing";
import { docsRoutes } from "./routes/docs";
import { apiRoutes } from "./routes/api";

const config = loadConfig();

const app = new Elysia();

if (Bun.env.NODE_ENV !== "production") {
  app.onBeforeHandle(() => {
    clearConfigCache();
  });
  console.log("Dev mode: config reloads on each request");
}

app
  .use(staticPlugin({ prefix: "/static", assets: "public", noCache: Bun.env.NODE_ENV !== "production" }))
  .use(landingRoutes)
  .use(docsRoutes)
  .use(apiRoutes)
  .listen(Number(Bun.env.PORT) || 3000);

console.log(`Docs site running at http://localhost:${app.server?.port}`);
