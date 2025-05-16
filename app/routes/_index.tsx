import LogInContainer from "../container/loginContainer";
import { Box } from "@mercury-js/mess";
import { commitSession, getSession } from "../sessions.server";
import { data, redirect } from "react-router";

// export async function loader({ request }: any) {
//   const session = await getSession(request.headers.get("Cookie"));

//   if (session.has("userId")) {
//     return redirect("/");
//   }
//   return data(
//     { error: session.get("error") },
//     {
//       headers: {
//         "Set-Cookie": await commitSession(session),
//       },
//     }
//   );

// }

const _index = () => {
  return (
    <Box>
      <LogInContainer />
    </Box>
  );
};

export default _index;
