import React from "react";
import { useEventSource } from "remix-utils/sse/react";

interface Props {
  incMsg: string;
}

const ClientTime: React.FC<Props> = ({ incMsg }) => {
  const eventSource = useEventSource("/api/sse");
  return (
    <div>
      <h2>Current Time:{eventSource}</h2>
      <button onClick={() => console.log(incMsg)}>Increment</button>
    </div>
  );
};

export default ClientTime;
