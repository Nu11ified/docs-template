import { Elysia } from "elysia";
import { renderToReadableStream } from "react-dom/server";

export const landingRoutes = new Elysia()
  .get("/", async () => {
    const stream = await renderToReadableStream(
      <html>
        <body>
          <h1>Landing</h1>
        </body>
      </html>
    );
    return new Response(stream, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  });
