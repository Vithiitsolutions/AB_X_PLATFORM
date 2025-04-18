import mercury from "@mercury-js/core";
import { ApolloServer, ApolloServerOptions, BaseContext } from "@apollo/server";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { applyMiddleware } from "graphql-middleware";
import { IResolvers } from "graphql-middleware/types";
import "./models/Test.ts";

interface IPlatformApiConfig {
  db: string;
}

export default class PlatformApi {
  schema = applyMiddleware(
    makeExecutableSchema({
      typeDefs: mercury.typeDefs,
      resolvers: mercury.resolvers as unknown as IResolvers,
    }),
  );
  config: ApolloServerOptions<BaseContext> = {
    schema: this.schema,
    introspection: true
  };
  server = new ApolloServer(this.config);
  constructor({
    db,
  }: IPlatformApiConfig) {
    mercury.connect(db || "mongodb+srv://techsupport:0505@cluster0.bdsfs.mongodb.net/qr-gate");
  }
  async start() {
    await this.server.start();
  }
  async restart() {
    this.config.schema = applyMiddleware(
      makeExecutableSchema({
        typeDefs: mercury.typeDefs,
        resolvers: mercury.resolvers as unknown as IResolvers,
      }),
    );
    // @ts-expect-error - added a method using patch to apollo server package
    await this.server.restart();
  }
}
