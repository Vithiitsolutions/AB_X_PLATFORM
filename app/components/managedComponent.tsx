import React, { useState, useEffect } from "react";
import _, { map, set } from "lodash";
import dynamic from "next/dynamic";

type DyComProps = {
  onClick: () => void;
  metaData?: any;
};

function ManagedComponent({
    metaData,
  managed = false,
  componentName
}: {
    metaData?:any;
  managed?: boolean;
  componentName?: string;
}) {

  let MyComponent =
    managed && componentName
      && dynamic(() =>
          import(`./CustomLayoutComponents`).then(
            (mod: any) => mod[componentName]
          )
        )

  return (
    <div className="App">
      <header
        className="App-header"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
        }}
      >
        {MyComponent && <MyComponent   />}
      </header>
    </div>
  );
}

export default ManagedComponent;

