import mercury from "@mercury-js/core";
import { ApolloServer, ApolloServerOptions, BaseContext } from "@apollo/server";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { applyMiddleware } from "graphql-middleware";
import { IResolvers } from "graphql-middleware/types";
import "./models";
import { transformSync } from "@babel/core";
import presetReact from "@babel/preset-react";
import { typeDefs } from "./schema";
import resolvers from "./resolvers";
import { QueueService } from "./models";
const queueService = QueueService.getInstance();
//@ts-ignore
mercury.queueService = queueService;

// hooks
import "./hooks/index.ts"

// Profiles
// import "./SystemAdmin.profile.ts";
// import "./Anonymous.profile.ts";
import { Platform } from "./platform.ts";
import {
  addResolversFromDBToMercury,
  getResolvers,
  registerHooksFromDB,
} from "./utility.ts";
import { CronService } from "./CronService.ts";
import { HistoryTracking } from "@mercury-js/plugins/historyTracking";
import { RedisCache } from "@mercury-js/plugins/redis";
import { RecordOwner } from "@mercury-js/plugins/recordOwner";

interface IMetaApiConfig {
  db: string;
  redisUrl?: string;
}
export default class MetaApi {
  public platform: Platform;
  public cronService: CronService;

  schema = applyMiddleware(
    makeExecutableSchema({
      typeDefs: mercury.typeDefs,
      resolvers: mercury.resolvers as unknown as IResolvers,
    })
  );
  config: ApolloServerOptions<BaseContext> = {
    schema: this.schema,
    introspection: true,
  };
  server = new ApolloServer(this.config);
  constructor({ db, redisUrl = "redis://localhost:6379" }: IMetaApiConfig) {
    mercury.connect(db);
    mercury.plugins([
      // new HistoryTracking(),
      new RedisCache({
        client: {
          socket: {
            tls: false
          },
          url: redisUrl,
        }
      }),
      // new RecordOwner()
    ]);
    mercury.addGraphqlSchema(typeDefs, resolvers);
    this.cronService = new CronService({ id: "", profile: "SystemAdmin" });
  }

  async start() {
    this.cronService.start();
    this.platform = new Platform();
    await this.platform.initialize();
    //@ts-ignore
    await mercury?.queueService.setUpQueues();
    await this.restart();
    await addResolversFromDBToMercury();
    await registerHooksFromDB();
  }
  async restart() {
    this.config.schema = applyMiddleware(
      makeExecutableSchema({
        typeDefs: mercury.typeDefs,
        resolvers: mercury.resolvers as unknown as IResolvers,
      })
    );
    // @ts-expect-error - added a method using patch to apollo server package
    await this.server.restart(this.config);
  }
}
