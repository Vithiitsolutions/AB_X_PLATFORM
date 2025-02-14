import React, { useEffect } from "react";
import useEventSource from "./useEventSource.ts";

interface Props {
  incMsg: string;
}

const ClientTime: React.FC<Props> = ({ incMsg }) => {
  const eventSource = useEventSource<{ message: string }>(
    "http://localhost:8000/sse/1",
  );
  useEffect(() => {
    console.log("Event Source", eventSource);
  }, [eventSource]);
  return (
    <div>
      <h2>Current Time:{eventSource?.message}</h2>
      <button onClick={() => console.log(incMsg)}>Increment</button>
    </div>
  );
};

export default ClientTime;
