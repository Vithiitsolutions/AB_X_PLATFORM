import React, { useEffect } from "react";
import type { Route } from "#types/routes/+types/home.ts";
import { Form, useNavigation, useSubmit } from "react-router";
import ClientTime from "../components/Counter.tsx";
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
export default function Counter({ loaderData }: { loaderData: LoaderData }) {
  const { q, data } = loaderData;
  const navigation = useNavigation();
  const submit = useSubmit();
  useEffect(() => {
    if (q !== null) {
      const form = document.getElementById("search-form");
      console.log("Heelo", q);
      if (form) {
        submit(form, { replace: true });
      }
    }
  }, [q, submit]);
  return (
    <div>
      <p>{loaderData.message}</p>
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
      <ClientTime />
    </div>
  );
}
