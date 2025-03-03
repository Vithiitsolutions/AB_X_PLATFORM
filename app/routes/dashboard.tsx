import React from "react";
import { Outlet } from "react-router";
import Navbar from "../components/navbar";
import { Box } from "@mercury-js/mess";
import SideBar from "../components/sidebar";
import { ThemeProvider } from "../utils/theme";

const dashboard = () => {
  return (
    <div>
       <ThemeProvider>
        
      <Navbar />
      <Box
        styles={{ base: { display: "flex", flexDirection: "row", gap: 20 } }}
      >
        <SideBar />
        <Outlet />
      </Box>
       </ThemeProvider>
    </div>
  );
};

export default dashboard;
