import { Form, Link, redirect } from "react-router";
import {
  getSession,
  destroySession,
} from "../sessions.server";


export async function action({
  request,
}: any) {
  const session = await getSession(
    request.headers.get("Cookie")
  );
  return redirect("/", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}

export default function LogoutRoute() {
  return (
    <>
      <p>Are you sure you want to log out?</p>
      <Form method="post">
        <button>Logout</button>
      </Form>
      <Link to="/dashboard">Never mind</Link>
    </>
  );
}
