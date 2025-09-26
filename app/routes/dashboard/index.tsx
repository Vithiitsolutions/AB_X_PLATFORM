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
  "where": {
    "isActive": true
  },
  "sort": {
    "createdOn": "desc"
  }
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
  return {
    tabs: sortedTabs,
    siteName: setting?.listSettings?.docs?.[0]?.siteName || "",
    logo: setting?.listSettings?.docs?.[0]?.logo || "/assets/logo.png",
    theme: theme?.listThemes?.docs?.[0]?.config ,
//     theme:{
//       "colors": {
//         "primary": {
//           "0": "#fff3ed",
//           "1": "#ffd8b8",
//           "2": "#ffbe82",
//           "3": "#ffa74d",
//           "4": "#ff9121",
//           "5": "#FF671F",
//           "6": "#e85a1c",
//           "7": "#cc4f19",
//           "8": "#b24317",
//           "9": "#993714",
//           "10": "#7f2c11"
//         },
//         "secondary": {
//           "0": "#f5f5f5",
//           "1": "#d9d9d9",
//           "2": "#bfbfbf",
//           "3": "#a6a6a6",
//           "4": "#8c8c8c",
//           "5": "#000000",
//           "6": "#000000",
//           "7": "#000000",
//           "8": "#000000",
//           "9": "#000000",
//           "10": "#000000"
//         },
//         "background": {
//           "0": "#ffffff",
//           "1": "#f9fafb",
//           "2": "#f3f4f6",
//           "3": "#e5e7eb",
//           "4": "#d1d5db",
//           "5": "#9ca3af",
//           "6": "#6b7280",
//           "7": "#4b5563",
//           "8": "#374151",
//           "9": "#1f2937",
//           "10": "#111827"
//         },
//         "text": {
//           "0": "#f9fafb",
//           "1": "#e5e7eb",
//           "2": "#d1d5db",
//           "3": "#9ca3af",
//           "4": "#6b7280",
//           "5": "#4b5563",
//           "6": "#374151",
//           "7": "#1f2937",
//           "8": "#111827",
//           "9": "#0f172a",
//           "10": "#0a0a0a"
//         },
//         "success": {
//           "0": "#ecfdf5",
//           "1": "#d1fae5",
//           "2": "#a7f3d0",
//           "3": "#6ee7b7",
//           "4": "#34d399",
//           "5": "#10b981",
//           "6": "#059669",
//           "7": "#047857",
//           "8": "#065f46",
//           "9": "#064e3b",
//           "10": "#064634"
//         },
//         "warning": {
//           "0": "#fffbeb",
//           "1": "#fef3c7",
//           "2": "#fde68a",
//           "3": "#fcd34d",
//           "4": "#fbbf24",
//           "5": "#f59e0b",
//           "6": "#d97706",
//           "7": "#b45309",
//           "8": "#92400e",
//           "9": "#78350f",
//           "10": "#451a03"
//         },
//         "error": {
//           "0": "#fef2f2",
//           "1": "#fee2e2",
//           "2": "#fecaca",
//           "3": "#fca5a5",
//           "4": "#f87171",
//           "5": "#ef4444",
//           "6": "#dc2626",
//           "7": "#b91c1c",
//           "8": "#991b1b",
//           "9": "#7f1d1d",
//           "10": "#4c0101"
//         }
//       },
//       "font": {
//         "base": "Inter, sans-serif",
//         "heading": "Poppins, sans-serif"
//       },
//       "radius": {
//         "sm": "4px",
//         "md": "8px",
//         "lg": "16px",
//         "xl": "24px",
//         "2xl": "32px",
//         "full": "9999px"
//       },
//       "tab": {
//   "iconColor": "#FF671F",
//   "tabHoverBgColor": "#FF671F",
//   "hoverIconColor": "#ffffff",
//   "tabBgColor": "#fff3ed",
//   "bgColor": "#ffffff",
//   "textColor": "black",
//   "hoverColor": "white",
//   "selectedTextColor": "#ffffff",
//   "selectedBgColor": "#FF671F",
//   "selectedIconColor": "#ffffff",

//   // Customizable layout props
//   "sidebarWidth": "240px",
//   "sidebarPadding": "10px 10px",
//   "tabPadding": "8px 12px",
//   "tabRadius": "6px",
//   "tabGap": "5px",
//   "fontSize": "12px",
//   "lineHeight": "12px",
//   "fontWeight": 600,
//   "borderLeft": "1px solid #FF671F"
// },
// "table": {
//   "border": "1px solid #ffb799",
//   "borderRadius": "8px",
//   "minWidth": "calc(100vw - 283px)",
//   "header-backgroundColor": "#FF671F",
//   "header-textColor": "white",
//   "header-fontSize": "14px",
//   "header-fontWeight": "700",
//   "header-padding": "12px 18px",
//   "header-borderBottom": "1px solid #ffb799",
// "row-backgroundColor": "#FFFFFF",
// "row-textColor": "black",
// "row-fontSize": "13px",
// "row-fontWeight": "400",
// "row-padding": "10px 18px",
// "row-hoverBg": "#fff3ed",
// "row-borderTop": "1px solid #ffb799"
//   // Customizable layout props
//   // "header": {
//   //   "padding": "12px 18px",
//   //   "fontSize": "14px",
//   //   "fontWeight": "700",
//   //   "backgroundColor": "#FF671F",
//   //   "textColor": "white",
//   //   "borderBottom": "1px solid #FF671F"
//   // },
//   // "row": {
//   //   "padding": "10px 18px",
//   //   "fontSize": "13px",
//   //   "fontWeight": "400",
//   //   "backgroundColor": "#FFFFFF",
//   //   "textColor": "black",
//   //   "hoverBg": "#fff3ed",
//   //   "borderTop": "1px solid #FF671F"
//   // }
// }

//     }
  };
}
const dashboard = ({
  loaderData,
}: {
  loaderData: { tabs: any; logo: string; siteName: string,theme:any };
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
console.log(loaderData.theme, JSON.parse(loaderData.theme) ,"loaderData.theme");
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  function injectTheme(theme) {
    if (!theme) return "";
  
    const cssVars = [];
  
    // Loop through all top-level keys (colors, tab, radius, etc.)
    Object.entries(theme).forEach(([groupKey, groupValue]) => {
      if (typeof groupValue === "object" && groupValue !== null) {
        Object.entries(groupValue).forEach(([key, value]) => {
          cssVars.push(`--${groupKey}-${key}: ${value};`);
        });
      } else {
        // For direct values (if any)
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
              width: "var(--tab-sidebarWidth)" ,
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
