import { A, Box } from "@mercury-js/mess";
import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router";
import { serverFetch } from "../../utils/action";

export async function clientLoader() {
  console.log("njkvakjdj");

  return { message: "Hello, world!" };
}

export async function loader() {
  return { message: "Hello, world!" };
}

function DynamicIcon({ iconName, loaderData }) {

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
  return <IconComponent style={{width: "15px"}}/>;
} 

function SideBar({ loaderData }) {

  const [openItems, setOpenItems] = useState<string[]>([]);
const location =useLocation()
console.log(location,"location?.state")
  const [tabs, setTabs] = useState([]);

  useEffect(() => {
    getTabs();
  }, []);


  // const tabs = [
  //   {
  //     "icon": "House",
  //     "order": 1,
  //     "id": "dashboard",
  //     "label": "Dashboard"
  //   },
  //   {
  //     "icon": "User",
  //     "order": 2,
  //     "id": "hrms",
  //     "label": "HRMS",
  //     "children": [
  //       {
  //         "icon": "CreditCard",
  //         "order": 1,
  //         "id": "payroll_management",
  //         "label": "Payroll Management",
  //         "children": []
  //       },
  //       {
  //         "icon": "Clock",
  //         "order": 2,
  //         "id": "attendance",
  //         "label": "Attendance",
  //         "children": []
  //       },
  //       {
  //         "icon": "Calendar",
  //         "order": 3,
  //         "id": "leave",
  //         "label": "Leave",
  //         "children": []
  //       },
  //       {
  //         "icon": "BarChart",
  //         "order": 4,
  //         "id": "employee_performance",
  //         "label": "Employee Performance",
  //         "children": []
  //       },
  //       {
  //         "icon": "Users",
  //         "order": 5,
  //         "id": "employee_data",
  //         "label": "Employee Data",
  //         "children": []
  //       }
  //     ]
  //   },
  //   {
  //     "icon": "Briefcase",
  //     "order": 3,
  //     "id": "business_management",
  //     "label": "Business Management",
  //     "children": [
  //       {
  //         "icon": "Building",
  //         "order": 1,
  //         "id": "business",
  //         "label": "Business",
  //         "children": []
  //       },
  //       {
  //         "icon": "ClipboardCheck",
  //         "order": 2,
  //         "id": "entity",
  //         "label": "Entity",
  //         "children": []
  //       },
  //       {
  //         "icon": "ShoppingCart",
  //         "order": 3,
  //         "id": "sales",
  //         "label": "Sales",
  //         "children": []
  //       },
  //       {
  //         "icon": "ShoppingBag",
  //         "order": 4,
  //         "id": "purchase",
  //         "label": "Purchase",
  //         "children": []
  //       },
  //       {
  //         "icon": "Wallet",
  //         "order": 5,
  //         "id": "expenses",
  //         "label": "Expenses",
  //         "children": []
  //       },
  //       {
  //         "icon": "Tag",
  //         "order": 6,
  //         "id": "expense_category",
  //         "label": "Expense Category",
  //         "children": []
  //       },
  //       {
  //         "icon": "Banknote",
  //         "order": 7,
  //         "id": "finances",
  //         "label": "Finances",
  //         "children": []
  //       }
  //     ]
  //   }
  // ]
  

  const getTabs = async () => {
    const data = await serverFetch(
      `query Docs {
            listTabs {
              docs {
                id
                label
                order
                icon
                model {
                    id
                    label
                    name
                  }
                childTabs {
                  id
                  icon
                  label
                  order
                  model {
                    id
                    label
                    name
                  }
                }
              }
            }
          }`,
        {
          sort: {
            order: "asc",
          },
        },
        {
          cache: "no-store"
        }
    )
    console.log(data);
    
    setTabs(data.listTabs.docs);
  };

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
        {items.map((item) => (
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
              <Box styles={{base:{
                display:"flex",
                flexDirection:"row",
                alignItems:"center",
                gap:5
              }}}>

              {/* ✅ Dynamic Icon Here */}
              <DynamicIcon iconName={item.icon} />
              <NavLink to={`/dashboard/o/${item?.model?.name}/list`} state={item?.id} className={`${location.pathname.includes( item?.id) && "text-black"}`}>{item.label}</NavLink></Box>

              {/* Dropdown Toggle Icon */}
              {item.children?.length > 0 && (
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
              item.children &&
              item.children.length > 0 && (
                <Box
                  styles={{
                    base: {
                      paddingLeft: "20px",
                      borderLeft: "1px solid #BCBCBC",
                    },
                  }}
                >
                  {renderMenu(item.children)}
                </Box>
              )}
          </Box>
        ))}
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
