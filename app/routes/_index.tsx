import LogInContainer from "../container/loginContainer";
import { Box } from "@mercury-js/mess";
import { commitSession, getSession } from "../sessions.server";
import { data, redirect } from "react-router";
import { parseCookies } from "../utils/functions";
import { serverFetch } from "../utils/action";

export async function loader({ request }: any) {
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
        cookies: request.headers.get("Cookie"),
      }
    );

    if (user.me?.id) {
      return redirect("/dashboard");
    }
  }

  const setting = await serverFetch(
    `query Docs {
        listSettings {
          docs {
            id
            loginSideImage
          }
        }
      }`,
    {},
    {
      cache: "no-store",
      ssr: true,
      cookies: request.headers.get("Cookie"),
    }
  );

  return {
    sideImage:
      setting?.listSettings?.docs?.[0]?.loginSideImage ||
      "https://res.cloudinary.com/doc9mueyf/image/upload/v1740652739/loginSideImage_jhlfyl.png",
    isDefault: !setting?.listSettings?.docs?.[0]?.loginSideImage,
  };
}

const _index = ({ loaderData }: { loaderData: { sideImage: string, isDefault: true } }) => {
  return (
    <Box>
      <LogInContainer sideImage={loaderData.sideImage} isDefault={loaderData.isDefault} />
    </Box>
  );
};

export default _index;
