import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import { loadConfig } from "./config";
import { landingRoutes } from "./routes/landing";
import { docsRoutes } from "./routes/docs";
import { apiRoutes } from "./routes/api";

const config = loadConfig();

const app = new Elysia()
  .use(staticPlugin({ prefix: "/static", assets: "public" }))
  .use(landingRoutes)
  .use(docsRoutes)
  .use(apiRoutes)
  .listen(3000);

console.log(`Docs site running at http://localhost:${app.server?.port}`);
