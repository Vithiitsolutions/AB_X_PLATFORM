import React from "react";
import StringToReactComponent from "string-to-react-component";

const DynamicComponentLoader = ({ code, props }: { code: string, props?: any }) => {
  return (
    <StringToReactComponent data={{ ...props }}>
      {`({Std})=>{
          ${atob(code)}
      }`}
    </StringToReactComponent>
    // <>{atob(code)}</>
  );
};

export default DynamicComponentLoader;
