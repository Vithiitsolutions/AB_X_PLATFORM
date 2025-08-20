import "dotenv/config";
import compression from "compression";
import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import bodyParser from "body-parser";
import { WebSocketServer, WebSocket } from "ws";
// Mercury Core setup - Metadata API
import MetaApi from "./server/metadata/index.js";
import { metaEvents } from "./server/metadata/Events.js";
import jwt from "jsonwebtoken";

let interval: NodeJS.Timeout;
// Websocket setup with error handling
const WS_PORT = Number.parseInt(process.env.WS_PORT || "9080");

let wss: WebSocketServer;

try {
  wss = new WebSocketServer({ port: WS_PORT });
  console.log(`WebSocket server started on port ${WS_PORT}`);
} catch (error) {
  console.error(`Failed to start WebSocket server on port ${WS_PORT}:`, error);
  process.exit(1);
}

wss.on("connection", function (ws: WebSocket) {
  console.log("New WebSocket connection established");
  
  interval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          data: new Date().toLocaleTimeString("en", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
        })
      );
    }
  }, 1000);

  ws.on("close", function () {
    console.log("WebSocket connection closed");
    if (interval) {
      clearInterval(interval);
    }
  });

  ws.on("error", function (error) {
    console.error("WebSocket error:", error);
    if (interval) {
      clearInterval(interval);
    }
  });
});

wss.on("error", function (error) {
  console.error("WebSocket server error:", error);
});

// Graceful shutdown handling
process.on("SIGINT", () => {
  console.log("\nShutting down gracefully...");
  if (interval) {
    clearInterval(interval);
  }
  wss.close(() => {
    console.log("WebSocket server closed");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  if (interval) {
    clearInterval(interval);
  }
  wss.close(() => {
    console.log("WebSocket server closed");
    process.exit(0);
  });
});
// Short-circuit the type-checking of the built output.
const BUILD_PATH = "./build/server/index.js";
const DEVELOPMENT = process.env.NODE_ENV === "development";
const PORT = Number.parseInt(process.env.PORT || "3000");
const DB_URL = process.env.DB_URL;
const REDIS_URL = process.env.REDIS_URL;

const app = express();
// Platform API Server
// const platformServer = new PlatformApi({
//   db: "mongodb://localhost:27017/mercury",
// });
// Metadata API server
export const metaServer = new MetaApi({
  db: DB_URL || "mongodb://localhost:27017/mercury",
  redisUrl: REDIS_URL,
});
await metaServer.start();

app.use(cors<cors.CorsRequest>({ origin: "*" }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));


metaEvents.on("CREATE_MODEL_RECORD", async (data: any) => {
  await metaServer.restart();
  console.log("GraphQL Schema updated because:", data?.msg);
});

app.use(
  "/meta-api",
  cors<cors.CorsRequest>(),
  bodyParser.json(),
  expressMiddleware(metaServer.server, {
    context: async ({ req }) => {
      const JWT_SECRET = process.env.JWT_SECRET || "default-secret-key";
      const authHeader = req.headers.authorization || "";
      const profileHeader = req.headers.profile as string || "";
      let user = {
        id: null,
        profile: "Anonymous",
      };

      if (authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as {
            id: any;
            profile: string;
          };
          user = {
            id: decoded.id,
            profile: decoded.profile || "Anonymous",
          };
        } catch (err) {
          console.warn("JWT verification failed:", (err as Error).message);
        }
      }
      if(profileHeader){
        user.profile = profileHeader;
      }
      
      return {
        ...req,
        user,
        platform: metaServer.platform,
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
