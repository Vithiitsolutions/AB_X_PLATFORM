import { useEffect, useState } from "react";

function useEventSource<T>(url: string): T | null {
  const [message, setEvent] = useState<T | null>(null);

  useEffect(() => {
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        console.log("Event Source", event);
        const parsedData: T = JSON.parse(event.data);
        setEvent(parsedData);
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      // Handle connection errors (e.g., reconnect) - You might want to set an error state here.
      // Example:
      // setEvent({ error: "SSE connection error" } as unknown as T); // Type assertion if needed
      eventSource.close(); // Close the connection if needed
    };

    return () => {
      eventSource.close(); // Close the connection when the component unmounts
    };
  }, [url]); // Re-establish connection if URL changes

  return message;
}

export default useEventSource;
