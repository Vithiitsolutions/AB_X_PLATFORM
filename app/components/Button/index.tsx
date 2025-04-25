import { A, Box, Button, Clx } from "@mercury-js/mess";
import React, { ReactNode, ButtonHTMLAttributes } from "react";
import { DynamicIcon } from "../sidebar";
import theme from "../../utils/colorTheme";

interface CustomButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  addOnStyles?: any;
  children?: ReactNode;
  [x:string]: any

}
interface DynamicButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  addOnStyles?: any;
  children?: ReactNode;
  [x:string]: any
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


export const DynamicButton: React.FC<DynamicButtonProps> = ({ addOnStyles= {}, children, onClick, ...props }) => {
  const button=(
    <Button
    styles={
      Clx({
        base: {
          background: props.variant == "primary"?theme.colors.black[0]:theme.colors.gray[9],
          fontSize: "14px",
          fontWeight: 600,
          lineHeight: "16px",
          borderRadius: "7px",
          color:props.variant == "primary"?theme.colors.white[0]:theme.colors.black[0],
          padding:"10px 20px",
          cursor:"pointer"
        },
      })}
    onClick={onClick}
    {...props}
    disabled={props.disabled}
  >
    <Box styles={{
      base:{
        display:"flex",
        flexDirection: props.iconPosition =="left"?"row":"row-reverse",
        gap:5,
        alignItems:"center"
      }
    }}>

                  { props.icon &&  <DynamicIcon iconName={props.icon} />}
    {children}
    </Box>
  </Button>
  )
  switch(props.type){
case "link":
  return (

  <A href={props.href}>

 {button}
  </A>
  )
  case "action":
    default:
      return (
        <>
        {button}
        </>

      );
  }
  
};