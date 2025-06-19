import React, { useState } from "react";
import Mess, { A, Box, Button, Image, Text } from "@mercury-js/mess";
import { FaChevronDown } from "react-icons/fa";
// import { useTheme } from "../../utils/theme";
function Navbar({ siteName, logo }: { siteName?: string; logo?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  // const { theme, toggleTheme } = useTheme();
  // console.log(theme, "theme");
  return (
    <Box
      styles={{
        base: {
          height: 56,
          width: "100vw",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          paddingTop: "15px",
          paddingBottom: "15px",
          paddingLeft: "30px",
          paddingRight: "60px",
          borderBottom: "1px solid #DCDCDC",
        },
        lg: {},
      }}
    >
      <Box
        styles={{
          base: {
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "20px",
          },
        }}
      >
        <Box
          styles={{
            base: {
              width: "42px",
              height: "25px",
            },
          }}
        >
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
        </Box>
        <Text
          styles={{
            base: {
              fontWeight: 700,
              fontSize: "20px",
              lineHeight: "27.32px",
              color: "#333333",
            },
          }}
        >
          {siteName}
        </Text>
      </Box>
      <Box
        styles={{
          base: {
            display: "flex",
            flexDirection: "row",
            gap: "5px",
            alignItems: "center",
            cursor: "pointer",
            position: "relative"
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
            },
          }}
        ></Box>
        <Text
          styles={{
            base: {
              fontWeight: 500,
              fontSize: 14,
              // lineHeight: 19.12,
              color: "#161616",
            },
          }}
        >
          User
        </Text>
        <FaChevronDown size={14} color="#161616" />

        {isOpen && (
          <Box styles={{ base: {position: "absolute", top: "2px", right: 0} }}>
            <Box
              styles={{
                base: {
                  clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                  position: "absolute",
                  background: "white",
                  top: "30px",
                  right: 20,
                  boxShadow: " 6px 7px 16px -7px rgba(0,0,0,0.86)",
                  color: "white",
                },
              }}
            >
              {""}
            </Box>
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
                  lineHeight: "19.12px",
                  color: "#161616",
                },
              }}
            >
              <Box
                styles={{
                  base: {
                    cursor: "pointer",
                  },
                }}
              >
                Dashboard
              </Box>
              {/* <Box
                styles={{
                  base: {
                    cursor: "pointer",
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "5px",
                  },
                }}
                onClick={toggleTheme}
              >
                <Image
                  src="/public/assets/darkModeIcon.png"
                  alt="Logo"
                  styles={{
                    base: {
                      width: "16px",
                      height: "16px",
                      background: theme == "light" ? "yellow" : "black",
                      borderRadius: "100%",
                      padding: 2,
                      objectFit: "contain",
                    },
                  }}
                />{" "}
                {theme == "light" ? "Light" : "Dark"} Mode
              </Box> */}
              <Box
                styles={{
                  base: {
                    cursor: "pointer",
                  },
                }}
              >
                Settings
              </Box>
              <Box
                styles={{
                  base: {
                    cursor: "pointer",
                  },
                }}
              >
                Account
              </Box>
              <A
                styles={{
                  base: {
                    cursor: "pointer",
                  },
                }}
                href="/logout"
              >
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
