import { Elysia } from "elysia";
import { renderToReadableStream } from "react-dom/server";

export const docsRoutes = new Elysia()
  .get("/docs/*", async ({ params }) => {
    const slug = params["*"];
    const stream = await renderToReadableStream(
      <html>
        <body>
          <h1>Docs: {slug}</h1>
        </body>
      </html>
    );
    return new Response(stream, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  });
