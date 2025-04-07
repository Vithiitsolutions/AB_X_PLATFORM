


import React, { useState, useEffect } from "react";

const DynamicComponentLoader = ({ code }: { code: string }) => {
  const [Component, setComponent] = useState<React.FC | null>(null);

  useEffect(() => {
    const fetchAndRender = async () => {
      try {
        // Optional: Decode from base64 if `code` is base64 encoded
        // const decodedCode = atob(code); 
        const decodedCode =  await fetch("http://localhost:4000/api");

        const { base64 } = await decodedCode.json();
        const jsCode = atob(base64);
//         const jsCode = `import React from "https://esm.sh/react";const TestComponent = () => {  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", null, "Count: "), /*#__PURE__*/React.createElement("button", {    onClick: () => alert("Finaally")  }, "Increment"));};export default TestComponent;
// `
        console.log(jsCode);
        
    const blob = new Blob([jsCode], { type: "application/javascript" });
    const blobUrl = URL.createObjectURL(blob);

    import(/* @vite-ignore */ blobUrl)
      .then((mod) => {
        setComponent(() => mod.default);
      })
      .catch((err) => {
        console.error("Failed to load component:", err);
      });

    return () => {
      URL.revokeObjectURL(blobUrl);
    };
      } catch (err) {
        console.error("Error loading dynamic component:", err);
      }
    };

    fetchAndRender();
  }, [code]);

  return Component ? <Component /> : <p>Loading...</p>;
};

export default DynamicComponentLoader;
