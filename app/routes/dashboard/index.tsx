import React from "react";
import { createCookie, Outlet, redirect } from "react-router";
import { Box } from "@mercury-js/mess";
import SideBar from "../../components/sidebar";
import { ThemeProvider } from "../../utils/theme";
import { serverFetch } from "../../utils/action";
import Navbar from "../../components/navbar";
import { parseCookies } from "../../utils/functions";
// import {Route } from "./+types/root";

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
    if (user.error) {
      return redirect("/");
    }
  } else return redirect("/");

  const profileResponse = await serverFetch(
    `query Docs($where: whereProfileInput) {
  listProfiles(where: $where) {
    docs {
      id
      name
    }
  }
}`,
    {
      where: {
        name: {
          is: cookieObject.role,
        },
      },
    },
    {
      cache: "no-store",
      ssr: true,
      cookies: request.headers.get("Cookie"),
    }
  );
  if (profileResponse.error) {
    return profileResponse.error;
  }

  const response = await serverFetch(
    `query Docs($where: whereTabInput, $sort: sortTabInput) {
        listTabs(where: $where, sort: $sort) {
          docs {
            id
            label
            order
            icon
            type
            recordId
            model {
                id
                label
                name
              }
            childTabs {
              id
              profiles {
              id
              label
              name

            }
              icon
              label
              order
              type
            recordId
              model {
                id
                label
                name
              }
              childTabs {
              id
              icon
              profiles {
              id
              label
              name

            }
              label
              order
              type
            recordId
              model {
                id
                label
                name
              }
            }
            }
            profiles {
              id
              label
              name

            }
            page {
              id
              name
              slug
            }
          }
        }
      }`,
    {
      where: {
        parent: {
          is: null,
        },
        profiles: {
          is: profileResponse?.listProfiles?.docs[0]?.id,
        },
      },
      sort: {
        order: "asc",
      },
    },
    {
      cache: "no-store",
      ssr: true,
      cookies: request.headers.get("Cookie"),
    }
  );

  if (response.error) {
    return response.error; //TODO: handle error
  }
  const sortTabs = (tabs) => {
    if (!tabs) return [];
    return tabs.filter((tab) => {
      if (tab.profiles && tab.profiles.length > 0) {
        return tab.profiles.some(
          (profile) => profile.name === cookieObject.role
        )
      }
    })
      .map((tab) => ({
        ...tab,
        childTabs: sortTabs(tab.childTabs),
      }))
      .sort((a, b) => {
        if (a.order === b.order) {
          return (a.label || "").localeCompare(b.label || "");
        }
        return a.order - b.order;
      });
  };

  const sortedTabs = sortTabs(response.listTabs?.docs);
  const setting = await serverFetch(
    `query Docs {
        listSettings {
          docs {
            id
            siteName
            logo
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
    tabs: sortedTabs,
    siteName:
      setting?.listSettings?.docs?.[0]?.siteName || "Mercury Platform",
    logo: setting?.listSettings?.docs?.[0]?.logo || "/assets/logo.png"
  };
}
const dashboard = ({ loaderData }: { loaderData: {tabs: any, logo: string, siteName: string} }) => {
  return (
    <div>
      {/* <ThemeProvider> */}
      <Navbar siteName={loaderData.siteName} logo={loaderData.logo}/>
      <Box styles={{ base: { display: "flex", flexDirection: "row" } }}>
        <SideBar tabs={loaderData.tabs} />
        <Box
          styles={{
            base: {
              width: "calc(100vw - 240px)",
              height: "calc(100vh - 56px)",
              padding: 20,
              overflow: "auto",
              background: "#F8F8F8",
            },
          }}
        >
          <Outlet />
        </Box>
      </Box>
      {/* </ThemeProvider> */}
    </div>
  );
};

export default dashboard;
