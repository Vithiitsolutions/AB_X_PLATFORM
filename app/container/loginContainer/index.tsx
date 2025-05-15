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
import { useEffect, useState } from "react";
import { serverFetch } from "../../utils/action";
import { useLazyQuery } from "../../utils/hook";

function LogInContainer() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [login, { data, loading, error }] = useLazyQuery(serverFetch);

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Form submission handler
  const handleSubmit = (e) => {
    e.preventDefault();

    // Reset previous errors
    setEmailError("");
    setPasswordError("");

    let isValid = true;

    if (!email) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      isValid = false;
    }

    if (isValid) {
      login(
        `query SignIn($value: String!, $validateBy: String!, $password: String!) {
          signIn(value: $value, validateBy: $validateBy, password: $password) {
            token
            user {
              id
            }
          }
        }`,
        {
          value: email,
          validateBy: "email",
          password: password,
        },
        {
          cache: "no-store",
        }
      );
    }
  };

  useEffect(()=>{
    if(data){
      if(data?.signIn?.token){
        // Cookies("token", data?.signIn?.token);
        // window.location.href = "/dashboard";
      }else{
        setEmailError("Invalid email or password");
      }
    }
  }, [data, error, loading]);

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
        <Box
          styles={{
            base: { maxWidth: "400px", width: "100%", textAlign: "center" },
          }}
        >
          <Box
            styles={{
              base: { display: "flex", flexDirection: "column", gap: "16px" },
            }}
          >
            <H1 styles={{ base: { fontSize: "30px", fontWeight: "bold" } }}>
              Sign In
            </H1>
            <Text styles={{ base: { color: "#6b7280" } }}>
              Enter your email and password below to login
            </Text>

            <Form
              styles={{
                base: { display: "flex", flexDirection: "column", gap: "16px" },
              }}
              onSubmit={handleSubmit}
            >
              <Box
                styles={{
                  base: {
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  },
                }}
              >
                <Input
                  styles={{
                    base: {
                      width: "100%",
                      padding: "10px",
                      border: emailError
                        ? "1px solid #ef4444"
                        : "1px solid #ddd",
                      borderRadius: "5px",
                    },
                  }}
                  placeholder="Enter your Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {emailError && (
                  <Text
                    styles={{
                      base: {
                        color: "#ef4444",
                        fontSize: "12px",
                        textAlign: "left",
                      },
                    }}
                  >
                    {emailError}
                  </Text>
                )}
              </Box>

              <Box
                styles={{
                  base: {
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  },
                }}
              >
                <Input
                  styles={{
                    base: {
                      width: "100%",
                      padding: "10px",
                      border: passwordError
                        ? "1px solid #ef4444"
                        : "1px solid #ddd",
                      borderRadius: "5px",
                    },
                  }}
                  placeholder="Enter your Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {passwordError && (
                  <Text
                    styles={{
                      base: {
                        color: "#ef4444",
                        fontSize: "12px",
                        textAlign: "left",
                      },
                    }}
                  >
                    {passwordError}
                  </Text>
                )}
              </Box>

              <Box
                styles={{
                  base: { display: "flex", justifyContent: "flex-end" },
                }}
              >
                <A
                  styles={{
                    base: {
                      color: "#2563eb",
                      fontSize: "14px",
                      textDecoration: "none",
                    },
                  }}
                  href="#"
                >
                  Forgot password?
                </A>
              </Box>

              <Button
                styles={{
                  base: {
                    padding: "10px",
                    background: "black",
                    color: "white",
                    borderRadius: "5px",
                    border: "none",
                    cursor: loading ? "wait" : "pointer",
                    fontWeight: "normal",
                    opacity: loading ? 0.7 : 1,
                  },
                }}
                type="submit"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Continue"}
              </Button>
            </Form>
          </Box>

          <Text
            styles={{
              base: { fontSize: "12px", color: "#666", marginTop: "20px" },
            }}
          >
            By clicking continue, you agree to our <Br />
            <A
              styles={{
                base: {
                  color: "#2563eb",
                  fontWeight: "bold",
                  textDecoration: "none",
                },
              }}
              href="#"
            >
              Terms of Service
            </A>{" "}
            and{" "}
            <A
              styles={{
                base: {
                  color: "#2563eb",
                  fontWeight: "bold",
                  textDecoration: "none",
                },
              }}
              href="#"
            >
              Privacy Policy
            </A>
            .
          </Text>

          <Box styles={{ base: { marginTop: "24px" } }}>
            <Text styles={{ base: { fontSize: "14px", color: "#666" } }}>
              Don't have an account?{" "}
              <A
                styles={{
                  base: {
                    color: "#2563eb",
                    fontWeight: "bold",
                    textDecoration: "none",
                  },
                }}
                href="#"
              >
                Sign up
              </A>
            </Text>
          </Box>
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
          "Unlock the power of simplicity with Mercury Where websites come to
          life effortlessly"
        </Text>
      </Box>
    </Box>
  );
}

export default LogInContainer;
