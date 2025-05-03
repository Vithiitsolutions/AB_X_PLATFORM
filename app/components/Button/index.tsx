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
  ...props
}) => {
  return (
    <Button
      styles={Clx({
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
      })}
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
  const button = (
    <Button
      styles={Clx({
        base: {
          background: getBackgroundColor(),
          fontSize: "12px",
          fontWeight: 600,
          lineHeight: "14px",
          borderRadius: "7px",
          color: getTextColor(),
          padding: "10px 20px",
          cursor: "pointer",
        },
      },addOnStyles)}
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
          styles={Clx({
            base: {
              background: getBackgroundColor(),
              fontSize: "14px",
              fontWeight: 600,
              lineHeight: "16px",
              borderRadius: "7px",
              color: getTextColor(),
              padding: "10px 20px",
              cursor: "pointer",
            },
          },addOnStyles)}
          onClick={onClick?onClick:InvokeFunction(props?.code || "")}
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
      console.error('Error executing code:', error);
    }
  };
}