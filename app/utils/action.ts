export async function serverFetch(query: string, variables: any, options: any) {
  const metaApiUrl =
    process.env.NODE_ENV == "development"
      ? "http://localhost:3000/meta-api"
      : "https://qr-gate-dev.mercuryx.cloud/meta-api";
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
