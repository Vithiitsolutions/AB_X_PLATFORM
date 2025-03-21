import mercury from "@mercury-js/core";
import { ApolloServer, ApolloServerOptions, BaseContext } from "@apollo/server";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { applyMiddleware } from "graphql-middleware";
import { IResolvers } from "graphql-middleware/types";
import "./models";

// hooks
import "./hooks/Model.hook.ts";

// Profiles
import "./SystemAdmin.profile.ts";
import { Platform } from "./platform.ts";

interface IMetaApiConfig {
  db: string;
}

export default class MetaApi {
  schema = applyMiddleware(
    makeExecutableSchema({
      typeDefs: mercury.typeDefs,
      resolvers: mercury.resolvers as unknown as IResolvers,
    })
  );
  config: ApolloServerOptions<BaseContext> = {
    schema: this.schema,
    introspection: true
  };
  server = new ApolloServer(this.config);
  constructor({ db }: IMetaApiConfig) {
    mercury.connect(db || "mongodb://localhost:27017")
  }
  async start() {
    const platform = new Platform();
    await platform.initialize();
    await this.restart();
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
