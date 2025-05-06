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

// hooks
import "./hooks/Model.hook.ts";
import "./hooks/permission.ts";
import "./hooks/modelField.ts";
import "./hooks/fieldPermission.ts";
import "./hooks/profile.ts";
import "./hooks/modelOption.ts";
import "./hooks/fieldOption.ts";
import "./hooks/function.ts";
import "./hooks/resolverSchema.ts";
import "./hooks/hook.ts";
import "./hooks/file.ts";

// Profiles
import "./SystemAdmin.profile.ts";
import { Platform } from "./platform.ts";
import { addResolversFromDBToMercury, getResolvers, registerHooksFromDB } from "./utility.ts";

interface IMetaApiConfig {
  db: string;
}

export default class MetaApi {
  public platform: Platform;

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
  constructor({ db }: IMetaApiConfig) {
    mercury.connect(db);
    mercury.addGraphqlSchema(typeDefs, resolvers);
  }

  async start() {
    await addResolversFromDBToMercury();
    await registerHooksFromDB();
    this.platform = new Platform();
    await this.platform.initialize();
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

