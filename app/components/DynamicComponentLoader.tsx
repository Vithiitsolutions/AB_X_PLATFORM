import React from "react";
import StringToReactComponent from "string-to-react-component";

const DynamicComponentLoader = ({ code, props }: { code: string, props?: any }) => {
  const [importedModules, setImportedModules] = React.useState<Record<string, any>>({});
  const [componentBody, setComponentBody] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    
    const decodeAndLoad = async () => {
      try {
        const decodedCode = atob(code); // base64 decode
        const [imports, body] = splitCodeContent(decodedCode);
        
        const modules = await extractImports(imports);
        setImportedModules(modules);
        
        setComponentBody(`${getImports(imports)}\n${body}`);
        // setComponentBody(`${body}`);
        setLoading(false);
      } catch (error) {
        console.error("Error loading dynamic component:", error);
      }
    };
    
    decodeAndLoad();
  }, [code]);

  if (!componentBody || Object.keys(importedModules).length === 0) return null;

  return (
    <>
   {loading? <>Loading......</> : <StringToReactComponent data={{ ...props, pkg: importedModules }}>
      {`({Std, pkg}) => {
        ${componentBody}
      }`}
    </StringToReactComponent>}
    </>
  );
};




export default DynamicComponentLoader;



function getImports(imports: string): string {
  const lines = imports.split('\n').filter(Boolean);
  const assignments: string[] = [];

  for (const line of lines) {
    const matchDefault = line.match(/import\s+([\w$]+)\s+from\s+['"][^'"]+['"]/);
    const matchNamed = line.match(/import\s+{([^}]+)}\s+from\s+['"][^'"]+['"]/);
    const matchAllAs = line.match(/import\s+\*\s+as\s+([\w$]+)\s+from\s+['"][^'"]+['"]/);

    if (matchDefault) {
      const name = matchDefault[1].trim();
      assignments.push(`const ${name} = pkg.${name};`);
    } else if (matchNamed) {
      const names = matchNamed[1].split(',').map(n => n.trim());
      for (const name of names) {
        assignments.push(`const ${name} = pkg.${name};`);
      }
    } else if (matchAllAs) {
      const alias = matchAllAs[1].trim();
      assignments.push(`const ${alias} = pkg.${alias};`);
    }
  }

  return assignments.join('\n');
}

const splitCodeContent = (code: string): [string, string] => {
  const importRegex = /^(import[\s\S]*?;\n*)+/;
  const imports = code.match(importRegex)?.[0] || '';
  const withoutImports = code.replace(importRegex, '').trim();

  const functionStartRegex = /export\s+default\s+function\s+\w+\s*\(\)\s*{/;
  const startMatch = withoutImports.match(functionStartRegex);
  
  if (!startMatch) {
    throw new Error("Could not find exported function declaration");
  }

  const startIndex = withoutImports.indexOf(startMatch[0]) + startMatch[0].length;
  let braceCount = 1;
  let currentIndex = startIndex;

  while (braceCount > 0 && currentIndex < withoutImports.length) {
    const char = withoutImports[currentIndex];
    if (char === '{') braceCount++;
    if (char === '}') braceCount--;
    currentIndex++;
  }

  const functionBody = withoutImports.slice(startIndex, currentIndex - 1).trim();
  return [imports, functionBody];
};



const extractImports = async (importBlock: string): Promise<Record<string, any>> => {
  const modules: Record<string, any> = {};
  const lines = importBlock.split('\n').filter(Boolean);
  
  
  for (const line of lines) {
    const match = line.match(/import\s+(?:\*\s+as\s+)?(?:{[^}]*}|[\w$]+)\s+from\s+['"](.+)['"]/);
    if (match) {
      const path = match[1];
      console.log(match, path, "import path");
      
      try {
        const mod = await import(/* @vite-ignore */ path);
        
        Object.assign(modules, mod);
      } catch (err) {
        console.error(`Failed to import ${path}:`, err);
      }
    }
  }

  return modules;
};
