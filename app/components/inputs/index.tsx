import * as React from "react";
import { Clx, Input ,Select, Option, Box} from "@mercury-js/mess";
import { ChevronDown } from "lucide-react";
import { relative } from "@react-router/dev/routes";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    addonstyles?: object; // Define styles as an optional prop
}
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    options: { label: string; value: string }[]; // Dynamic options
    addonstyles?: any;
    placeholder?:string
  }
const CustomeInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, addonstyles = {}, ...props }, ref) => {
    return (
      <Input
        type={type}
        styles={Clx(
          {
            base: {
              height: 40,
              width: "100%",
              border: "1.05px solid #E5E5E5",
              borderRadius: "10.51px",
              paddingLeft: 10,
              fontSize:"14px",
              paddingRight: 10, // Leave space for the icon

            },
          },
          addonstyles // Merge user-defined styles
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
const CustomSelect = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ options, addonstyles = {},placeholder, ...props }, ref) => {
      return (

        <Box
        styles={{
          base: {
            position: "relative", // Make parent relative for absolute positioning
            display: "inline-block", // Adjust width based on content
          },
        }}
      >
        <Select
          ref={ref}
          styles={Clx(
            {
              base: {
                height: 40,
                width: "100%", // Inherit width from parent
                border: "1.05px solid #E5E5E5",
                borderRadius: "10.51px",
                paddingLeft: 10,
              fontSize:"14px",
                paddingRight: 35, // Leave space for the icon
                backgroundColor: "#fff",
                cursor: "pointer",
                appearance: "none",
              },
            },
            addonstyles
          )}
          {...props}
        >
          {placeholder && <Option disabled>{placeholder}</Option>}
          {options.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>

        {/* Dropdown Icon (absolute inside Box) */}
        <Box
          styles={{
            base: {
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            },
          }}
        >
          <ChevronDown size={20} color="#555" />
        </Box>
      </Box>

       
      );
    }
  );
export { CustomeInput,CustomSelect  };
