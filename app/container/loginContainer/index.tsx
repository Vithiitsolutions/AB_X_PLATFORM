import {
  A,
  Box,
  Br,
  Button,
  Form,
  H1,
  Hr,
  Image,
  Input,
  Text,
} from "@mercury-js/mess";
import React from "react";
// import { router } from "websocket";
// import image from "../../../public/assets/loginSideImage.png"
function LogInContainer() {
  return (
    <Box
    styles={{
      base: {
        display: "grid",
        gridTemplateColumns: "1fr", 
        width: "100%",
        minHeight: "100vh",
      },
      lg: {
        gridTemplateColumns: "1fr 1fr", 
      },
    }}
  >
    <Box
      styles={{
        base: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          width: "100%",
          height: "100vh",
        },
      }}
    >
      <Box styles={{ base: { maxWidth: "400px", width: "100%", textAlign: "center" } }}>
        <Box styles={{ base: { display: "flex", flexDirection: "column", gap: "16px" } }}>
          <H1 styles={{ base: { fontSize: "30px", fontWeight: "bold" } }}>Sign In</H1>
          <Text styles={{ base: { color: "#6b7280" } }}>
            Enter your email and password below to login
          </Text>
  
          <Form styles={{ base: { display: "flex", flexDirection: "column", gap: "16px" } }}>
            <Input
              styles={{
                base: {
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                },
              }}
              placeholder="Enter your Email"
              type="email"
            />
            <Input
              styles={{
                base: {
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                },
              }}
              placeholder="Enter your Password"
              type="password"
            />
  
            <Button
              styles={{
                base: {
                  padding: "10px",
                  background: "black",
                  color: "white",
                  borderRadius: "5px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "normal",
                },
              }}

            //   onClick={()=>router.push("/dashboard")}
            >
              Continue
            </Button>
          </Form>
        </Box>
  
        <Box
          styles={{
            base: {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "40px 0",
              width: "100%",
              position: "relative",
            },
          }}
        >
          <Hr
            styles={{
              base: {
                width: "100%",
                backgroundColor: "#ddd",
                height: "1px",
                border: "none",
                position: "absolute",
                top: "50%",
              },
            }}
          />
          <Text
            styles={{
              base: {
                background: "white",
                padding: "0 10px",
                fontSize: "12px",
                color: "#666",
                zIndex: 1,
              },
            }}
          >
            OR CONTINUE WITH
          </Text>
        </Box>
  
        <Button
          styles={{
            base: {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              padding: "10px",
              background: "white",
              border: "1px solid #ddd",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
              width: "100%",
            },
          }}
        >
          <Image
            styles={{ base: { width: "20px", height: "20px" } }}
            src="https://cdn-icons-png.flaticon.com/256/25/25231.png"
            alt="GitHub"
          />
          GitHub
        </Button>
  
        <Text styles={{ base: { fontSize: "12px", color: "#666", marginTop: "20px" } }}>
          By clicking continue, you agree to our <Br />
          <A styles={{ base: { color: "#2563eb", fontWeight: "bold", textDecoration: "none" } }} href="#">
            Terms of Service
          </A>{" "}
          and{" "}
          <A styles={{ base: { color: "#2563eb", fontWeight: "bold", textDecoration: "none" } }} href="#">
            Privacy Policy
          </A>
          .
        </Text>
      </Box>
    </Box>
  
    {/* RIGHT COLUMN: IMAGE + OVERLAY TEXT */}
    <Box
      styles={{
        base: {
          width: "100%",
          height: "100vh",
          position: "relative",
          display: "none", // Hide by default (for mobile)
        },
        lg: {
          display: "block", // Show only on large screens
        },
      }}
    >
      {/* Background Image */}
      <Image
        src="https://res.cloudinary.com/doc9mueyf/image/upload/v1740652739/loginSideImage_jhlfyl.png"
        alt="Background"
        styles={{
          base: {
            width: "100%",
            height: "100%",
            objectFit: "cover",
          },
        }}
      />
  
      {/* Overlay Text */}
      <Text
        styles={{
          base: {
            position: "absolute",
            color: "black",
            fontSize: "24px",
            fontWeight: 600,
            bottom: "96px",
            left: "50%",
            transform: "translateX(-50%)", // Centers text horizontally
            textAlign: "center",
            lineHeight: "40px",
            background: "rgba(255, 255, 255, 0.7)", // Slight background for readability
            borderRadius: "8px",
            padding: "10px 20px",
          },
        }}
      >
        “Unlock the power of simplicity with Mercury Where websites come to life effortlessly”
      </Text>
    </Box>
  </Box>
  
  );
}

export default LogInContainer;
