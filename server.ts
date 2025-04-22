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
import { Platform } from "./server/metadata/platform.ts";
import { transformSync } from "@babel/core";
import presetReact from "@babel/preset-react";

let interval: number;
// Websocket setup
const wss = new WebSocketServer(9080);
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
const DB_URL = Deno.env.get("DB_URL");

const app = express();
// Platform API Server
// const platformServer = new PlatformApi({
//   db: "mongodb://localhost:27017/mercury",
// });
// Metadata API server
const metaServer = new MetaApi({
  db: DB_URL,
});
await metaServer.start();

function rewriteImports(code: string) {
  return code.replace(
    /import\s+(?:(\w+)\s*(?:,\s*)?)?(?:\{([^}]+)\})?\s+from\s+["']([^"']+)["']/g,
    (_, defaultImport, namedImports, pkg) => {
      const imports: string[] = [];

      // Handle default import
      if (defaultImport) {
        imports.push(`import ${defaultImport} from "https://esm.sh/${pkg}";`);
      }

      // Handle named imports
      if (namedImports) {
        namedImports
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
          .forEach((name) => {
            const [orig, alias] = name.split(" as ").map((n) => n.trim());
            const finalName = alias || orig;
            imports.push(
              `import ${finalName} from "https://esm.sh/${pkg}/${orig}";`
            );
          });
      }

      return imports.join("\n");
    }
  );
}

app.use(cors<cors.CorsRequest>());
app.use(bodyParser.json());

app.get("/api", (req: Request, res: Response) => {
  // compile.ts
  console.log("------------into the block");

  const jsxCode = `import React from "react";
import dayjs from "dayjs";
import classNames from "classnames";
import {isString, isEmpty} from "lodash";

const GreetingCard = () => {
  const userName = "Praveen ✨";
  const today = dayjs();
  const isWeekend = today.day() === 0 || today.day() === 6;

  const cardClass = classNames("card", {
    weekend: isWeekend,
    weekday: !isWeekend,
  });

  return (
    <div
      className={cardClass}
      style={{
        fontFamily: "Segoe UI, sans-serif",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        backgroundColor: isWeekend ? "#FFFBF0" : "#F0F9FF",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: "24px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
          width: "350px",
        }}
      >
        <h2 style={{ marginBottom: "12px", color: "#333" }}>
          {isString(userName) ? userName : "Welcome, Guest"}
        </h2>
        <p style={{ fontSize: "14px", color: "#555" }}>
          Today is <strong>{today.format("dddd, MMMM D, YYYY")}</strong>
        </p>
        <p style={{ marginTop: "8px", color: "#888", fontStyle: "italic" }}>
          {isWeekend ? "Chill! It's weekend 😎" : "Back to grind 💻"}
        </p>
      </div>
    </div>
  );
};

export default GreetingCard;
  `;

  const output = transformSync(rewriteImports(jsxCode), {
    presets: [presetReact],
    sourceType: "module",
  });

  const base64 = Buffer.from(output?.code!).toString("base64");
  console.log("Base64 Encoded:", base64);

  res.json({
    base64,
  });
});

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
          profile: req.headers.profile ?? "Anonymous"
        },
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
