import compression from "compression";
import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import bodyParser from "body-parser";
import { WebSocketClient, WebSocketServer } from "websocket";
// Mercury Core setup - Metadata API
import MetaApi from "./server/metadata/index.ts";
import { metaEvents } from "./server/metadata/Events.ts";
import { meta } from "./app/routes/counter.tsx";
import { profile } from "node:console";

let interval: number;
// Websocket setup
const wss = new WebSocketServer(8080);
wss.on("connection", function (ws: WebSocketClient) {
  // ws.on("message", function (message: string) {
  interval = setInterval(() => {
    ws.send(
      JSON.stringify({
        data: new Date().toLocaleTimeString("en", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      })
    );
  }, 1000);
  // });
});
wss.on("close", function () {
  clearInterval(interval);
});
// Short-circuit the type-checking of the built output.
const BUILD_PATH = "./build/server/index.js";
const DEVELOPMENT = Deno.env.get("NODE_ENV") === "development";
const PORT = Number.parseInt(Deno.env.get("PORT") || "3000");

const app = express();
// Platform API Server
// const platformServer = new PlatformApi({
//   db: "mongodb://localhost:27017/mercury",
// });
// Metadata API server
const metaServer = new MetaApi({
  db: "mongodb+srv://admin:123@cluster0.mosjp.mongodb.net/mercury-platform",
});
await metaServer.start();

metaEvents.on("CREATE_MODEL_RECORD", async (data: any) => {
  console.log("Model Record Created: ");
  await metaServer.restart();
});

app.use(
  "/meta-api",
  cors<cors.CorsRequest>(),
  bodyParser.json(),
  expressMiddleware(metaServer.server, {
    context: async ({ req }) => {
      return {
        ...req,
        user: {
          id: 1,
          profile: "SystemAdmin",
        },
      };
    },
  }) as unknown as express.RequestHandler
);

// app.use(
//   "/platform",
//   cors<cors.CorsRequest>(),
//   bodyParser.json(),
//   expressMiddleware(platformServer.server) as unknown as express.RequestHandler
// );

// React Router Setup
app.use(compression());
app.disable("x-powered-by");

if (DEVELOPMENT) {
  console.log("Starting development server");
  const viteDevServer = await import("vite").then((vite) =>
    vite.createServer({
      server: { middlewareMode: true },
    })
  );
  app.use(viteDevServer.middlewares);
  app.use(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const source = await viteDevServer.ssrLoadModule("./server/app.ts");
      return await source.app(req, res, next);
    } catch (error) {
      if (typeof error === "object" && error instanceof Error) {
        viteDevServer.ssrFixStacktrace(error);
      }
      next(error);
    }
  });
} else {
  console.log("Starting production server");
  app.use(
    "/assets",
    express.static("build/client/assets", { immutable: true, maxAge: "1y" })
  );
  app.use(
    "/components",
    express.static("components", { immutable: true, maxAge: "1y" })
  );
  app.use(express.static("build/client", { maxAge: "1h" }));
  // app.use(
  //   "/server/assets",
  //   express.static("build/server/assets", { immutable: true, maxAge: "1y" })
  // );
  app.use(await import(BUILD_PATH).then((mod) => mod.app));
}

app.use(morgan("tiny"));

// await new Promise<void>((resolve) =>
//   httpServer.listen({ port: 4000 }, resolve)
// );
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
