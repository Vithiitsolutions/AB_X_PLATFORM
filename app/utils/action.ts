export async function serverFetch(query: string, variables: any, options: any) {
  const metaApiUrl =
    process.env.NODE_ENV == "development"
      ? "http://localhost:4000/meta-api"
      //@ts-ignore
      : import.meta.env.VITE_BACKEND_URL!;
  try {
    const data = await fetch(metaApiUrl, {
      method: "POST",
      headers: {
        profile: "SystemAdmin",
        "Content-Type": "application/json",
        "x-apollo-operation-name": "SomeOperation",
        "apollo-require-preflight": "true",
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
