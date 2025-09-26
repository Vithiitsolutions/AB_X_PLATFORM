import { A, Box, Text } from "@mercury-js/mess";
import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router";
import { serverFetch } from "../../utils/action";
// import { useTheme } from "../../utils/theme-context";
// import type {Route} from "../../../../mercuryx-platform/.react-router/types/app/+types/root"
// export async function clientLoader() {
//   console.log("njkvakjdj");

//   return { message: "Hello, world!" };
// }

export function DynamicIcon({
  iconName,
  color,
  hoveredColor,
}: {
  iconName: string;
  color?: string;
  hoveredColor?: string | null;
}) {
  console.log(iconName, color, "iconName");
  const [IconComponent, setIconComponent] =
    useState<React.ComponentType | null>(null);
  useEffect(() => {
    if (!iconName) return;

    import("lucide-react")
      .then((module) => {
        const Icon = module[iconName];
        if (Icon) {
          setIconComponent(() => Icon);
        } else {
          console.error(`Icon '${iconName}' not found in lucide-react.`);
        }
      })
      .catch((err) => console.error("Error loading icon:", err));
  }, [iconName]);
  console.log(IconComponent, "IconComponent");

  if (!IconComponent) return <div style={{ width: "10px" }}>⌛</div>;
  return (
    <IconComponent style={{ width: "15px" }} color={hoveredColor ?? color} />
  );
}

const STORAGE_KEY = "sidebar-open-items";
function SideBar({ tabs }: { tabs: any[] }) {
  // const { theme } = useTheme();
  // console.log(theme,"themess");
  const [openItems, setOpenItems] = useState<string[]>([]);
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setOpenItems(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(openItems));
  }, [openItems]);

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }

      const isChild = tabs.some((parent: any) =>
        parent.childTabs?.some((child) => child.id === id)
      );

      return isChild ? [...prev, id] : [id];
    });
  };

  const renderMenu = (items) => {
    return (
      <Box
        styles={{
          base: {
            display: "flex",
            flexDirection: "column",
            gap: "var(--tab-tabGap)",
          },
        }}
      >
        {items?.length
          ? items?.map((item) => {
              const isActive =
                location.pathname.includes(item?.model?.name) ||
                (item?.model?.name === "Dashboard" &&
                  location.pathname.endsWith("dashboard")) ||
                location.pathname.includes(item?.page?.slug) ||
                location.pathname.includes(item?.recordId);

              return (
                <Box
                  key={item.id}
                  styles={{
                    base: {
                      display: "flex",
                      flexDirection: "column",
                      gap: "var(--tab-tabGap)",
                    },
                  }}
                >
                  <A
                    href={
                      item.model?.name === "Dashboard"
                        ? "/dashboard"
                        : item?.model?.name || item.page?.slug || item.recordId
                          ? item?.type === "LIST"
                            ? `/dashboard/o/${item?.model?.name}/list`
                            : item?.type === "RECORD"
                              ? `/dashboard/o/${item?.model?.name}/r/${item?.recordId}`
                              : item?.type === "PAGE"
                                ? `/dashboard/page/${item?.page?.slug}`
                                : "#"
                          : "#"
                    }
                    onClick={() => toggleItem(item.id)}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    styles={{
                      base: {
                        fontSize: "var(--tab-fontSize)",
                        lineHeight: "var(--tab-lineHeight)",
                        fontWeight: "var(--tab-fontWeight)",
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "10px",
                        cursor: "pointer",
                        padding: "var(--tab-tabPadding)",
                        borderRadius: "var(--tab-tabRadius)",
                        background: isActive
                          ? "var(--tab-selectedBgColor)"
                          : "var(--tab-tabBgColor)",
                        color: isActive
                          ? "var(--tab-selectedTextColor)"
                          : "var(--tab-textColor)",
                        transition: "all 0.2s ease-in-out",
                        ":hover": {
                          background: isActive
                            ? "var(--tab-selectedBgColor)"
                            : "var(--tab-tabHoverBgColor)",
                          color: isActive
                            ? "var(--tab-selectedTextColor)"
                            : "var(--tab-hoverColor)",
                        },
                      },
                    }}
                    className="menu-item"
                    data-active={isActive} // 👈 optional, helps debugging
                  >
                    <A
                      styles={{
                        base: {
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 5,
                          textDecoration: "none",
                          // color: isActive
                          //   ? "var(--tab-selectedTextColor)"
                          //   : "var(--tab-textColor)",
                        },
                      }}
                    >
                      <DynamicIcon
                        iconName={item.icon}
                        color={
                          isActive
                            ? "var(--tab-selectedIconColor)"
                            : "var(--tab-iconColor)"
                        }
                        hoveredColor={
                          hoveredItem === item.id
                            ? "var(--tab-hoverIconColor)"
                            : null
                        }
                      />
                      <Text>{item.label}</Text>
                    </A>

                    {/* Dropdown Toggle Icon */}
                    {item.childTabs?.length > 0 && (
                      <Box
                        styles={{
                          base: {
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            alignSelf: "center",
                            // color:isActive
                            // ? "var(--tab-selectedIconColor)"
                            // : "var(--tab-iconColor)",
                            // ":hover":{
                            //   color: hoveredItem === item.id
                            //     ? "var(--tab-hoverIconColor)"
                            //     : "var(--tab-iconColor)",
                            // },
                          },
                        }}
                      >
                        {openItems.includes(item.id) ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{
                              color: isActive
                                ? "var(--tab-selectedIconColor)"
                                : hoveredItem === item.id
                                  ? "var(--tab-hoverIconColor)"
                                  : "var(--tab-iconColor)",
                              transition: "color 0.2s ease-in-out",
                            }}
                          >
                            <path d="m18 15-6-6-6 6" />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{
                              color: isActive
                                ? "var(--tab-selectedIconColor)"
                                : hoveredItem === item.id
                                  ? "var(--tab-hoverIconColor)"
                                  : "var(--tab-iconColor)",
                              transition: "color 0.2s ease-in-out",
                            }}
                          >
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                        )}
                      </Box>
                    )}
                  </A>

                  {openItems.includes(item.id) &&
                    item.childTabs &&
                    item.childTabs.length > 0 && (
                      <Box
                        styles={{
                          base: {
                            paddingLeft: "20px",
                            borderLeft: "var(--tab-borderLeft)",
                          },
                        }}
                      >
                        {renderMenu(item.childTabs)}
                      </Box>
                    )}
                </Box>
              );
            })
          : null}
      </Box>
    );
  };

  return (
    <Box
      styles={{
        base: {
          height: "calc(100vh - 56px)",
          background: "var(--tab-bgColor)",
          // width: "240px",
          padding: "var(--tab-sidebarPadding)",
        },
      }}
    >
      {renderMenu(tabs)}
    </Box>
  );
}

export default SideBar;
