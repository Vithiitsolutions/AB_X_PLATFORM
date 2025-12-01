import fetch from "node-fetch";

interface Msg91EmailPayload {
  to: { email: string }[];
  from: { email: string; name: string };
  domain: string;
  template_id: string;
  variables: Record<string, any>;
}

export const sendEmailViaMSG91 = async (
  toEmail: string,
  templateId: string,
  variables: Record<string, any>
) => {
  const payload: Msg91EmailPayload = {
    to: [{ email: toEmail }],
    from: {
      email: "no-reply@abhinavbharath.com",
      name: "Abhinav Bharath Team",
    },
    domain: "abhinavbharath.com",
    template_id: templateId,
    variables,
  };

  const response = await fetch("https://api.msg91.com/api/v5/email/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authkey: process.env.MSG91_AUTH_KEY!,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  console.log("MSG91 Email Response:", data);

  if (!response.ok || data.type !== "success") {
    throw new Error(`MSG91 email failed: ${JSON.stringify(data)}`);
  }
  return data;
};
