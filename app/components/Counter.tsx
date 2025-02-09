import React from "react";
import { useEventSource } from "remix-utils/sse/react";
import { StandardWebSocketClient, WebSocketClient } from "websocket";

const ClientTime = () => {
  const eventSource = useEventSource("/api/sse");

  return (
    <div>
      <h2>Current Time:{eventSource}</h2>
      {/* <p>{formattedTime}</p> */}
      {/* <div>{counter}</div> */}
      <button onClick={() => console.log("Incre")}>Increment</button>
    </div>
  );
};

export default ClientTime;
