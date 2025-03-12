import { A, Box } from "@mercury-js/mess";
import React, { useEffect, useState } from "react";



export async function clientLoader() {
  console.log("njkvakjdj");
  
  return { message: "Hello, world!" };
}


function DynamicIcon({ iconName }) {

  const [IconComponent, setIconComponent] = useState<React.ComponentType | null>(null);
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
  console.log(IconComponent,"IconComponent")

  if (!IconComponent) return <div style={{ width: "24px" }}>⌛</div>; 
  return <IconComponent />;
}

function SideBar({loaderData}) {
  console.log(loaderData, "--------");
  
  const [openItems, setOpenItems] = useState<string[]>([]);

  const tabJson = [
    {
      icon: "House",
      order: 1,
      id: "dashboard",
      label: "Dashboard",

    },
    {
      icon: "UserCog",
      order: 2,
      id: "customers",
      label: "Customers",

    },
    {
      icon: "ClipboardList",
      order: 3,
      id: "orders",
      label: "Orders",
      children: [
        {
          icon: "AdminSettings",
          order: 1,
          id: "admin_settings",
          label: "Settings",
          children: [],
        },
        {
          icon: "AdminReports",
          order: 2,
          id: "admin_reports",
          label: "Reports",
          children: [],
        },
        {
          icon: "AdminUsers",
          order: 3,
          id: "admin_users",
          label: "Manage Users",
          children: [
            {
              icon: "SubAdmin",
              order: 1,
              id: "sub_admin",
              label: "Sub Admin",
              children: [],
            },
          ],
        },
      ],
    },
    {
      icon: "Package",
      order: 3,
      id: "products",
      label: "Products",
      children: [
        {
          icon: "AdminSettings",
          order: 1,
          id: "admin_settings",
          label: "Settings",
          children: [],
        },
        {
          icon: "AdminReports",
          order: 2,
          id: "admin_reports",
          label: "Reports",
          children: [],
        },
        {
          icon: "AdminUsers",
          order: 3,
          id: "admin_users",
          label: "Manage Users",
          children: [
            {
              icon: "SubAdmin",
              order: 1,
              id: "sub_admin",
              label: "Sub Admin",
              children: [],
            },
          ],
        },
      ],
    },
    {
      icon: "ChartNoAxesColumnIncreasing",
      order: 3,
      id: "analytics",
      label: "Analytics",
      children: [
        {
          icon: "AdminSettings",
          order: 1,
          id: "admin_settings",
          label: "Settings",
          children: [],
        },
        {
          icon: "AdminReports",
          order: 2,
          id: "admin_reports",
          label: "Reports",
          children: [],
        },
        {
          icon: "AdminUsers",
          order: 3,
          id: "admin_users",
          label: "Manage Users",
          children: [
            {
              icon: "SubAdmin",
              order: 1,
              id: "sub_admin",
              label: "Sub Admin",
              children: [],
            },
          ],
        },
      ],
    },
  ];

const toggleItem = (id: string) => {
  setOpenItems((prev) => {
    if (prev.includes(id)) {
      return prev.filter((item) => item !== id);
    }

    const isChild = tabJson.some((parent) =>
      parent.children?.some((child) => child.id === id)
    );

    return isChild ? [...prev, id] : [id]; 
  });
};


  const renderMenu = (items) => {
    return (
      <Box styles={{ base: { display: "flex", flexDirection: "column", gap: "15px" } }}>
        {items.map((item) => (
          <Box key={item.id} styles={{base:{
            display: "flex",
                  flexDirection: "column",
                  gap:10
          }}}>
            <Box
              onClick={() => toggleItem(item.id)}
              styles={{
                base: {
                  fontSize: "14px",
                  lineHeight: "19.12px",
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
              <Box>{item.label}</Box></Box>

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

            {openItems.includes(item.id) && item.children && item.children.length > 0 && (
              <Box styles={{ base: { paddingLeft: "20px", borderLeft: "1px solid #BCBCBC" } }}>
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
      {renderMenu(tabJson)}
    </Box>
  );
}

export default SideBar;
