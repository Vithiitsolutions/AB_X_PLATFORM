export async function serverFetch(query: string, variables: any, options: any) {
  console.log("metaApiUrl");
  const metaApiUrl =
    process.env.NODE_ENV == "dev"
      ? "http://localhost:4000/meta-api"
      : "https://qr-gate-dev.mercuryx.cloud/meta-api";
  try {
    const data = await fetch(metaApiUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-apollo-operation-name": "Docs",
        profile: "SystemAdmin",
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
