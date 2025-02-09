import React from "react";
import type { Route } from "#types/routes/+types/home.ts";
import Likes, { Increment } from "../components/Likes.tsx";

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
const Home: React.FC<{ loaderData: LoaderData }> = (
  { loaderData },
) => {
  return (
    <div>
      Hello World! Welcome to MercuryX Platform
      <p>{loaderData.message}</p>
      <Likes animal="cats" />
      <Increment animal="cats" />
    </div>
  );
};

export default Home;
