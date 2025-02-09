import React, { useEffect } from "react";
import type { Route } from "#types/routes/+types/home.ts";
import { Form, useSubmit } from "react-router";
import ClientTime from "../components/Counter.tsx";
import { SubmitTarget } from "react-router";
import { AnimalStore } from "../store/index.ts";
import AnimalCard from "../components/AnimalCard.tsx";
import { useStore } from "@tanstack/react-store";
export function meta() {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

type LoaderData = {
  q: string;
  data: string;
};

export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const data = `this is ${q}`;
  return { q, data };
}
const Counter: React.FC<{ loaderData: LoaderData }> = ({ loaderData }) => {
  const { q, data } = loaderData;
  const catLikes = useStore(AnimalStore, (state) => state.cats);
  const submit = useSubmit();
  useEffect(() => {
    if (q !== null) {
      const form = document.getElementById("search-form");
      console.log("Heelo", q);
      if (form) {
        submit(form as SubmitTarget, { replace: true });
      }
    }
  }, [q, submit, catLikes]);
  return (
    <div>
      <AnimalCard name="cats" likes={catLikes} />
      <Form
        id="search-form"
        onChange={(event) => {
          const isFirstSearch = q === null;
          submit(event.currentTarget, {
            replace: !isFirstSearch,
          });
        }}
        role="search"
      >
        <input
          aria-label="Search"
          type="search"
          id="q"
          name="q"
          defaultValue={q || ""}
          placeholder="Search"
        />
        <div aria-hidden hidden={true} id="search-spinner" />
      </Form>
      <div>{data}</div>
      <ClientTime incMsg="Counter" />
    </div>
  );
};

export default Counter;
