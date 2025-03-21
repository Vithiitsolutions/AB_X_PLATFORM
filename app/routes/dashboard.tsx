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
        <Box styles={{ base: { display: "flex", flexDirection: "row" } }}>
          <SideBar />
          <Box
            styles={{
              base: {
                width: "calc(100vw - 280px)",

                padding: 20,
              },
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </ThemeProvider>
    </div>
  );
};

export default dashboard;
