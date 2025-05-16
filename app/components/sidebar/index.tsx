import { A, Box } from "@mercury-js/mess";
import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router";
import { serverFetch } from "../../utils/action";
// import type {Route} from "../../../../mercuryx-platform/.react-router/types/app/+types/root"
// export async function clientLoader() {
//   console.log("njkvakjdj");

//   return { message: "Hello, world!" };
// }

export function DynamicIcon({ iconName }) {
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
  return <IconComponent style={{ width: "15px" }} />;
}

const STORAGE_KEY = "sidebar-open-items";
function SideBar({ tabs }: { tabs: any[] }) {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const location = useLocation();

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
          base: { display: "flex", flexDirection: "column", gap: "15px" },
        }}
      >
        {items?.length
          ? items?.map((item) => (
              <Box
                key={item.id}
                styles={{
                  base: {
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  },
                }}
              >
                <Box
                  onClick={() => toggleItem(item.id)}
                  styles={{
                    base: {
                      fontSize: "12px",
                      lineHeight: "12.12px",
                      color: "#4A4A50",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "10px",
                    },
                  }}
                >
                  <Box
                    styles={{
                      base: {
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 5,
                      },
                    }}
                  >
                    <DynamicIcon iconName={item.icon} />
                    {item?.model ? (
                      <A
                        href={
                          item.model.name === "Dashboard"
                            ? "/dashboard"
                            : item?.type === "LIST"
                            ? `/dashboard/o/${item?.model?.name}/list`
                            : `/dashboard/o/${item?.model?.name}/r/${item?.recordId}`
                        }
                        // state={item?.id}
                        className={`${
                          (location.pathname.includes(item?.model?.name) ||
                            item?.model?.name == "Dashboard") &&
                          "text-black"
                        }`}
                      >
                        {item.label}
                      </A>
                    ) : (
                      <Box
                        className={`${
                          location.pathname.includes(item?.model?.name) &&
                          "text-black"
                        }`}
                      >
                        {item.label}
                      </Box>
                    )}
                  </Box>

                  {/* Dropdown Toggle Icon */}
                  {item.childTabs?.length > 0 && (
                    <Box
                      styles={{
                        base: {
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          alignSelf: "center",
                        },
                      }}
                    >
                      {openItems.includes(item.id) ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-chevron-up"
                        >
                          <path d="m18 15-6-6-6 6" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-chevron-down"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      )}
                    </Box>
                  )}
                </Box>

                {openItems.includes(item.id) &&
                  item.childTabs &&
                  item.childTabs.length > 0 && (
                    <Box
                      styles={{
                        base: {
                          paddingLeft: "20px",
                          borderLeft: "1px solid #BCBCBC",
                        },
                      }}
                    >
                      {renderMenu(item.childTabs)}
                    </Box>
                  )}
              </Box>
            ))
          : null}
      </Box>
    );
  };

  return (
    <Box
      styles={{
        base: {
          height: "calc(100vh - 56px)",
          background: "#EEEEEE",
          width: "240px",
          paddingTop: "15px",
          paddingBottom: "15px",
          paddingLeft: "30px",
          paddingRight: "30px",
        },
      }}
    >
      {renderMenu(tabs)}
    </Box>
  );
}

export default SideBar;
