import { Box } from "@mercury-js/mess";
import Cookies from "js-cookie";
import { useEffect } from "react";
import { redirect, useNavigate } from "react-router";

export default function LogoutRoute() {
    const navigate = useNavigate();
  useEffect(() => {
    Cookies.remove("userId");
    Cookies.remove("role");
    Cookies.remove("token");
    navigate("/");
  }, []);
  return (
    <Box
      styles={{
        base: {
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        },
      }}
    >
      Loading.....
    </Box>
  );
}
