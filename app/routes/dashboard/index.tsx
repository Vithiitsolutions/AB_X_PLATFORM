import React, { useState } from "react";
import { createCookie, Outlet, redirect } from "react-router";
import { Box } from "@mercury-js/mess";
import SideBar from "../../components/sidebar";
import { ThemeProvider } from "../../utils/theme-context";
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
    `query Docs($where: whereTabInput, $sort: sortTabInput, $limit: Int!, $offset: Int!) {
  listTabs(where: $where, sort: $sort, limit: $limit, offset: $offset) {
    docs {
      id
      label
      order
      icon
      type
      recordId
      view {
        id
        label
        name
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
          view {
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
        childTabs {
          id
          icon
          view {
        id
        label
        name
      }
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
    }
  }
}
`,
    {
      where: {
        parent: {
          is: null,
        },
        profiles: {
          is: profileResponse?.listProfiles?.docs[0]?.id,
        },
      },
      limit: 1000,
      offset: 0,
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
            buttons {
        id
        icon
        href
        disabled
        buttonFn {
          id
          code
          name
          description
        }
        iconPosition
        label
        text
        type
        variant
      }
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
  const theme = await serverFetch(
    `query ListThemes($where: whereThemeInput, $sort: sortThemeInput) {
  listThemes(where: $where, sort: $sort) {
    docs {
      id
      label
      isActive
      config
      createdOn
      updatedOn
    }
  }
}`,
    {
      where: {
        isActive: true,
      },
      sort: {
        createdOn: "desc",
      },
    },
    {
      cache: "no-store",
      ssr: true,
      cookies: request.headers.get("Cookie"),
    }
  );
  if (theme.error) {
    return theme.error; //TODO: handle error
  }

  const defaultTheme = {
    button: {
      backgroundColor: "#000000",
      hoverBgColor: "#333333",
    },
    tab: {
      iconColor: "#1a1a1a",
      hoverIconColor: "black",
      bgColor: "#ffffff",
      textColor: "black",
      hoverColor: "black",
      selectedTextColor: "#000000",
      selectedBgColor: "#ffffff",
      selectedIconColor: "#000000",

      sidebarWidth: "240px",
      sidebarPadding: "10px 10px",
      tabPadding: "8px 12px",
      tabRadius: "6px",
      tabGap: "5px",
      fontSize: "12px",
      lineHeight: "12px",
      fontWeight: 600,
      borderLeft: "1px solid #1a1a1a",
    },
    table: {
      border: "1px solid #cccccc",
      borderRadius: "8px",
      minWidth: "calc(100vw - 283px)",
      "header-backgroundColor": "#F2F2F2",
      "header-textColor": "black",
      "header-fontSize": "14px",
      "header-fontWeight": "700",
      "header-padding": "12px 18px",
      "header-borderBottom": "1px solid #cccccc",

      "row-backgroundColor": "#FFFFFF",
      "row-textColor": "black",
      "row-fontSize": "13px",
      "row-fontWeight": "400",
      "row-padding": "10px 18px",
      "row-hoverBg": "#f2f2f2",
      "row-borderTop": "1px solid #cccccc",
    },
    buttons: {
      primaryButton: {
        type: "object",
        base: {
          backgroundColor: "black",
          color: "white",
        },
      },
      secondaryButton: {
        type: "object",
        base: {
          backgroundColor: "#CBCBCB",
          color: "black",
        },
      },
    },
  };
  return {
    tabs: sortedTabs,
    siteName: setting?.listSettings?.docs?.[0]?.siteName || "",
    logo: setting?.listSettings?.docs?.[0]?.logo || "/assets/logo.png",
    theme: theme?.listThemes?.docs?.[0]?.config || JSON.stringify(defaultTheme),
    buttons: setting?.listSettings?.docs?.[0]?.buttons || []
  };
}
const dashboard = ({
  loaderData,
}: {
  loaderData: { tabs: any; logo: string; siteName: string; theme: any;buttons:any[] };
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  function injectTheme(theme: any) {
    if (!theme) return "";

    const cssVars: string[] = [];

    Object.entries(theme).forEach(([groupKey, groupValue]) => {
      if (typeof groupValue === "object" && groupValue !== null) {
        Object.entries(groupValue).forEach(([key, value]) => {
          // ✅ if explicitly marked type:"object"
          if (
            typeof value === "object" &&
            value !== null &&
            (value as any).type === "object"
          ) {
            const { type, ...rest } = value;
            cssVars.push(`--${groupKey}-${key}: ${JSON.stringify(rest)};`);
          } else if (typeof value === "object" && value !== null) {
            // expand normally
            Object.entries(value).forEach(([innerKey, innerValue]) => {
              cssVars.push(`--${groupKey}-${key}-${innerKey}: ${innerValue};`);
            });
          } else {
            cssVars.push(`--${groupKey}-${key}: ${value};`);
          }
        });
      } else {
        cssVars.push(`--${groupKey}: ${groupValue};`);
      }
    });

    return `:root { ${cssVars.join("\n")} }`;
  }

  return (
    <div>
      {/* <ThemeProvider initialTheme={loaderData?.theme}> */}
      {loaderData.theme && (
        <style>{injectTheme(JSON?.parse(loaderData.theme))}</style>
      )}
      <Navbar
        siteName={loaderData.siteName}
        logo={loaderData.logo}
        buttons={loaderData.buttons}
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
              width: "var(--tab-sidebarWidth)",
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
              width: "100%",
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
