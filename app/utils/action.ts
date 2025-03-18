
export async function serverFetch(query: string, variables: any, options: any) {
  try {
    const data = await fetch(`http://localhost:4000/meta-api`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-apollo-operation-name": "Docs",
        profile: "SystemAdmin"
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      ...options,
    });
    let parseData = await data.json();
    
    if (parseData?.errors) {
      return { error: parseData?.errors[0] };
    }

    return parseData?.data;
  } catch (error) {
    return { error: error };
  }
}
