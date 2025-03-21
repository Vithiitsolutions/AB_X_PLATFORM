import { Button, Clx } from "@mercury-js/mess";
import React, { ReactNode, ButtonHTMLAttributes } from "react";

interface CustomButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  addOnStyles?: any;
  children?: ReactNode;
}

const CustomeButton: React.FC<CustomButtonProps> = ({ addOnStyles= {}, children, onClick, ...props }) => {
  return (
    <Button
      styles={
        Clx({
          base: {
            background: "black",
            fontSize: "14px",
            fontWeight: 600,
            lineHeight: "16px",
            borderRadius: "7px",
            color:"white",
            padding:"10px 20px",
            cursor:"pointer"
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