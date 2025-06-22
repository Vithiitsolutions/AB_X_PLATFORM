import React, { useState } from "react";
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
    return tabs
      .filter((tab) => {
        if (tab.profiles && tab.profiles.length > 0) {
          return tab.profiles.some(
            (profile) => profile.name === cookieObject.role
          );
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
    siteName: setting?.listSettings?.docs?.[0]?.siteName || "",
    logo: setting?.listSettings?.docs?.[0]?.logo || "/assets/logo.png",
  };
}
const dashboard = ({
  loaderData,
}: {
  loaderData: { tabs: any; logo: string; siteName: string };
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  return (
    <div>
      {/* <ThemeProvider> */}
      <Navbar
        siteName={loaderData.siteName}
        logo={loaderData.logo}
        onMenuClick={toggleSidebar} // Add this prop to your Navbar to show menu icon on mobile
      />
      <Box
        styles={{
          base: { display: "flex", flexDirection: "row", paddingTop: "57px" },
        }}
      >
        {/* Sidebar */}
        <Box
          styles={{
            base: {
              position: "fixed",
              top: 56,
              left: sidebarOpen ? 0 : -240,
              width: 240,
              height: "calc(100vh - 56px)",
              background: "#fff",
              boxShadow: "2px 0 6px rgba(0,0,0,0.1)",
              transition: "left 0.3s ease-in-out",
              zIndex: 50,
            },
            lg: {
              position: "relative",
              left: 0,
              top: 0,
              height: "auto",
              boxShadow: "none",
              zIndex: 0,
            },
          }}
        >
          <SideBar tabs={loaderData.tabs} />
        </Box>
        <Box
          styles={{
            base: {
              height: "calc(100vh - 56px)",
              overflow: "auto",
              padding: 0,
              background: "#F8F8F8",
            },
            lg: {
              width: "calc(100vw - 240px)",
              padding: 20,
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
