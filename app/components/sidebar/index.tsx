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

function SideBar({tabs}: {tabs: any[]}) {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const location = useLocation();
  console.log(location, "location?.state");
  // const [tabs, setTabs] = useState([]);

  // useEffect(() => {
  //   getTabs();
  // }, []);

  // const getTabs = async () => {
  //   const data = await serverFetch(
  //     `query Docs($where: whereTabInput, $sort: sortTabInput) {
  //           listTabs(where: $where, sort: $sort) {
  //             docs {
  //               id
  //               label
  //               order
  //               icon
  //               model {
  //                   id
  //                   label
  //                   name
  //                 }
  //               childTabs {
  //                 id
  //                 icon
  //                 label
  //                 order
  //                 model {
  //                   id
  //                   label
  //                   name
  //                 }
  //               }
  //               profiles {
  //                 id
  //                 label
  //                 name

  //               }
  //             }
  //           }
  //         }`,
  //     {
  //       where: {
  //         parent: {
  //           is: null,
  //         },
  //       },
  //       sort: {
  //         order: "asc",
  //       },
  //     },
  //     {
  //       cache: "no-store",
  //     }
  //   );
  //   console.log(data);

  //   let sortedTabs = data.listTabs.docs.sort((a, b) => a.order - b.order);

  //   // Sort child tabs inside each main tab
  //   sortedTabs = sortedTabs.map((tab) => ({
  //     ...tab,
  //     childTabs: tab.childTabs.sort((a, b) => a.order - b.order),
  //   }));
  
  //   setTabs(sortedTabs);
  // };

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
        {items?.length ? items?.map((item) => (
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
                {/* ✅ Dynamic Icon Here */}
                <DynamicIcon iconName={item.icon} />
                {item?.model ? (
                  <NavLink
                    to={`/dashboard/o/${item?.model?.name}/list`}
                    state={item?.id}
                    className={`${
                      location.pathname.includes(item?.model?.name) &&
                      "text-black"
                    }`}
                  >
                    {item.label}
                  </NavLink>
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
        )): null}
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
