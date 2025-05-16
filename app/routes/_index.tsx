import LogInContainer from "../container/loginContainer";
import { Box } from "@mercury-js/mess";
import { commitSession, getSession } from "../sessions.server";
import { data, redirect } from "react-router";
import { parseCookies } from "../utils/functions";
import { serverFetch } from "../utils/action";

export async function loader({ request }: any) {
  // const session = await getSession(request.headers.get("Cookie"));

  // if (session.has("userId")) {
  //   return redirect("/");
  // }
  // return data(
  //   { error: session.get("error") },
  //   {
  //     headers: {
  //       "Set-Cookie": await commitSession(session),
  //     },
  //   }
  // );

  const cookies = request.headers.get("Cookie");
  const cookieObject = parseCookies(cookies);
  if (cookieObject.userId && cookieObject.role && cookieObject.token) {
    const user = await serverFetch(
      `query Me {
             me {
               id
             }
           }`,
      {},
      {
        cache: "no-store",
        ssr: true,
        cookies: request.headers.get("Cookie")
      }
    );
    
    if (user.me?.id) {
      return redirect("/dashboard");
    }
  }
}

const _index = () => {
  return (
    <Box>
      <LogInContainer />
    </Box>
  );
};

export default _index;
