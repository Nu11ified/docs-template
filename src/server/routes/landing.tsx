import { Elysia } from "elysia";
import { renderToReadableStream } from "react-dom/server";
import { loadConfig } from "../config";
import { Shell } from "../../shared/Shell";
import { LandingLayout } from "../../shared/layouts/LandingLayout";
import { SectionRenderer } from "../../shared/landing/SectionRenderer";

export const landingRoutes = new Elysia()
  .get("/", async () => {
    const config = loadConfig();
    const stream = await renderToReadableStream(
      <Shell title={config.site.name} description={config.site.tagline} config={config}>
        <LandingLayout config={config}>
          <SectionRenderer sections={config.landing.sections} />
        </LandingLayout>
      </Shell>
    );
    return new Response(stream, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  });
