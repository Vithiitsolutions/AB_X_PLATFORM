import React from "react";
import type { Route } from "#types/routes/+types/home.ts";
import { Outlet } from "react-router";

export function meta() {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

type LoaderData = {
  message: string;
};

export function loader({ context }: Route.LoaderArgs) {
  return {
    message: context.VALUE_FROM_EXPRESS as string,
  };
}
export default function Home({ loaderData }: { loaderData: LoaderData }) {
  return (
    <div>
      Hello World! Welcome to MercuryX Platform
      <p>{loaderData.message}</p>
    </div>
  );
}
