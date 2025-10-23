import Cookies from "js-cookie";

import React, { useState } from "react";
import Mess, { A, Box, Button, Image, Text } from "@mercury-js/mess";
import { FaChevronDown } from "react-icons/fa";
import { FiMenu } from "react-icons/fi"; // Hamburger menu icon

function Navbar({
  siteName,
  logo,
  buttons,
  onMenuClick,
}: {
  siteName?: string;
  logo?: string;
  buttons?: any[];
  onMenuClick?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Box
      styles={{
        base: {
          height: 56,
          width: "100vw",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingLeft: "20px",
          paddingRight: "20px",
          borderBottom: "1px solid #DCDCDC",
          background: "#fff",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 100,
        },
      }}
    >
      {/* Left side: Logo + Name */}
      <Box
        styles={{
          base: {
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "12px",
          },
        }}
      >
        {/* Mobile menu icon */}
        {onMenuClick && (
          <Box
            // className="md:hidden"
            onClick={onMenuClick}
            styles={{
              base: {
                cursor: "pointer",
                display: "block",
              },
              lg: {
                display: "none",
              },
            }}
          >
            <FiMenu size={20} />
          </Box>
        )}

        {/* Logo */}
        <Image
          src={logo}
          alt="Logo"
          styles={{
            base: {
              width: "42px",
              height: "25px",
              objectFit: "contain",
            },
          }}
        />
        <Text
          styles={{
            base: {
              fontWeight: 700,
              fontSize: "20px",
              lineHeight: "27.32px",
              color: "#333333",
              whiteSpace: "nowrap",
            },
          }}
        >
          {siteName}
        </Text>
      </Box>

      {/* Right side: User dropdown */}
      <Box
        styles={{
          base: {
            display: "flex",
            flexDirection: "row",
            gap: "5px",
            alignItems: "center",
            cursor: "pointer",
            position: "relative",
          },
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Box
          styles={{
            base: {
              width: 36,
              height: 36,
              borderRadius: "100%",
              background: "gray",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "white",
              fontWeight: 500,
              fontSize: 18,
              textAlign:"center"
            },
          }}
        >
          <Text className="">{Cookies.get("userName")?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </Box>
        <Text
          styles={{
            base: {
              fontWeight: 500,
              fontSize: 14,
              color: "#161616",
            },
          }}
        >
          {Cookies.get("userName")}
        </Text>
        <FaChevronDown size={14} color="#161616" />

        {/* Dropdown */}
        {isOpen && (
          <Box
            styles={{ base: { position: "absolute", top: "2px", right: 0 } }}
          >
            <Box
              styles={{
                base: {
                  position: "absolute",
                  top: "40px",
                  right: 0,
                  background: "white",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  width: "130px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  fontSize: "14px",
                  fontWeight: 500,
                  zIndex: 99,
                },
              }}
            >
              {(buttons ?? [])?.length > 0 && (buttons ?? []).filter((item) => item?.type == "link").map((button) => (
                <A 
                  key={button.id}
                  styles={{ base: { cursor: "pointer" } }}  href={button.href || "#"}>
                  {button.text}
                </A>
              ))}
              {/* <Box styles={{ base: { cursor: "pointer" } }}>Dashboard</Box> */}
              {/* <Box styles={{ base: { cursor: "pointer" } }}>Settings</Box> */}
              {/* <Box styles={{ base: { cursor: "pointer" } }}>Account</Box> */}
              <A styles={{ base: { cursor: "pointer" } }} href="/logout">
                Logout
              </A>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Navbar;
