import type { Route } from "#types/+types/root.ts";
import { eventStream } from "remix-utils/sse/server";

export function loader({ request }: Route.LoaderArgs) {
  return eventStream(request.signal, function setup(send) {
    const interval = setInterval(() => {
      send({
        data: new Date().toLocaleTimeString("en", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      });
    }, 1000);

    return function cleanup() {
      clearInterval(interval);
    };
  });
}
