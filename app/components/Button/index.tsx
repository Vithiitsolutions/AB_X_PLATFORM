import { A, Box, Button, Clx } from "@mercury-js/mess";
import React, { ReactNode, ButtonHTMLAttributes } from "react";
import { DynamicIcon } from "../sidebar";
import theme from "../../utils/colorTheme";

interface CustomButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  addOnStyles?: any;
  children?: ReactNode;
  [x: string]: any;
}
interface DynamicButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  addOnStyles?: any;
  children?: ReactNode;
  [x: string]: any;
}
const CustomeButton: React.FC<CustomButtonProps> = ({
  addOnStyles = {},
  children,
  onClick,
  className,
  ...props
}) => {
  function getThemeObject(varName: string): any {
    try {
      // normalize the variable name
      let cssVar = varName.trim();
  
      // if user passed var(--xxx), strip "var(" and ")"
      if (cssVar.startsWith("var(")) {
        cssVar = cssVar.slice(4, -1).trim(); // remove var( and )
      }
  
      // ensure it starts with --
      if (!cssVar.startsWith("--")) {
        cssVar = `--${cssVar}`;
      }
  
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue(cssVar)
        .trim();
  // console.log(typeof value, "value");
  // console.log(JSON.parse(value), "varName");
  // alert(JSON.parse(value));
      // if (!value) return null;
  
      // if it's a stringified object, parse it
      if (value.startsWith("{") || value.startsWith("[")) {
        return JSON.parse(value);
      }
  
      // otherwise just return as a normal string
      return value;
    } catch (e) {
      console.error("Error parsing theme var:", varName, e);
      return null;
    }
  }
  // console.log(className, "className");
  const addStyles = getThemeObject(className || "") || {}
// console.log(addStyles, "addStyles");
  return (
    <Button
    styles={Clx(
      {
        base: {
          background: "black",
          fontSize: "14px",
          fontWeight: 600,
          lineHeight: "16px",
          borderRadius: "7px",
          color: "white",
          padding: "10px 20px",
          cursor: "pointer",
        },
      },
      addOnStyles,
      addStyles
    )}
    onClick={onClick}
    {...props}
  >
    {children}
  </Button>
  
  );
};

export default CustomeButton;

export const DynamicButton: React.FC<DynamicButtonProps> = ({
  addOnStyles = {},
  children,
  onClick,
  ...props
}) => {
  const getBackgroundColor = () => {
    if (props.variant === "primary") return theme.colors.black[0];
    if (props.variant === "danger") return theme.colors.red[8];
    return theme.colors.gray[9];
  };

  const getTextColor = () => {
    if (props.variant === "primary") return theme.colors.white[0];
    if (props.variant === "danger") return theme.colors.white[0];
    return theme.colors.black[0];
  };
  function getThemeObject(varName: string): any {
    try {
      // normalize the variable name
      let cssVar = varName.trim();
  
      // if user passed var(--xxx), strip "var(" and ")"
      if (cssVar.startsWith("var(")) {
        cssVar = cssVar.slice(4, -1).trim(); // remove var( and )
      }
  
      // ensure it starts with --
      if (!cssVar.startsWith("--")) {
        cssVar = `--${cssVar}`;
      }
  
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue(cssVar)
        .trim();
  // console.log(typeof value, "value");
  // console.log(JSON.parse(value), "varName");
  // alert(JSON.parse(value));
      // if (!value) return null;
  
      // if it's a stringified object, parse it
      if (value.startsWith("{") || value.startsWith("[")) {
        return JSON.parse(value);
      }
  
      // otherwise just return as a normal string
      return value;
    } catch (e) {
      console.error("Error parsing theme var:", varName, e);
      return null;
    }
  }
  const addStyles = getThemeObject(props?.className || "") || {}
  //"buttons-primaryButton"
  // console.log(addStyles, "addStyles");
  // console.log(getThemeObject("buttons-primaryButton"));
  // alert(getThemeObject("buttons-primaryButton"));
  // { backgroundColor: "red", color: "white", padding: "10px 15px" }
  
  // console.log(getThemeObject("tab-sidebarWidth"));
    // ✅ reads from --buttons-primaryButton
  // alert(getThemeObject("var(--tab-sidebarWidth)"))
  // alert(getThemeObject("--buttons-primaryButton"))

  // console.log(getThemeObject("--buttons-primaryButton")); 
  // also works
    const button = (
    <Button
      styles={Clx(
        {
          base: {
            background: getBackgroundColor(),
            fontSize: "12px",
            fontWeight: 600,
            lineHeight: "12px",
            borderRadius: "7px",
            color: getTextColor(),
            cursor: "pointer",
          },
        },
        addOnStyles,
        addStyles
      )}
      onClick={onClick}
      title={props?.title}
      {...props}
      disabled={props.disabled}
    >
      <Box
        styles={{
          base: {
            display: "flex",
            flexDirection: props.iconPosition == "left" ? "row" : "row-reverse",
            gap: 5,
            alignItems: "center",
          },
        }}
      >
        {props.icon && <DynamicIcon iconName={props.icon} />}
        {children}
      </Box>
    </Button>
  );
  switch (props.type) {
    case "link":
      return <A href={props.href}>{button}</A>;
    case "action":
      return (
        <Button
          styles={Clx(
            {
              base: {
                background: getBackgroundColor(),
                fontSize: "12px",
                fontWeight: 600,
                lineHeight: "12px",
                borderRadius: "7px",
                color: getTextColor(),
                cursor: "pointer",
                padding: "3px 8px"
              },
            },
            addOnStyles,
            addStyles
          )}
          onClick={onClick ? onClick : InvokeFunction(props?.code || "")}
          {...props}
          disabled={props.disabled}
          title={props?.title}
        >
          <Box
            styles={{
              base: {
                display: "flex",
                flexDirection:
                  props.iconPosition == "left" ? "row" : "row-reverse",
                gap: 5,
                alignItems: "center",
              },
            }}
          >
            {props.icon && <DynamicIcon iconName={props.icon} />}
            {children}
          </Box>
        </Button>
      );
    default:
      return <>{button}</>;
  }
};

function InvokeFunction(code: string) {
  return () => {
    try {
      if (!code) return;
      const decodedCode = atob(code);

      const executeFunction = new Function(decodedCode);
      executeFunction();
    } catch (error) {
      console.error("Error executing code:", error);
    }
  };
}
