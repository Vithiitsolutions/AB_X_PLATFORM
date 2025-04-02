import mercury from "@mercury-js/core";
import { metaEvents } from "../Events.ts";
import type { Platform } from "../platform.ts";

type HookModel = {
  record: {
    name: string;
    label: string;
    description: string;
    managed: boolean;
  };
};

mercury.hook.after("CREATE_MODEL_RECORD", function (this: HookModel) {
  mercury.list.map((model) => {
    console.log(model);
  });
  // mercury.createModel(this.record.name, {

  // });
  metaEvents.emit("CREATE_MODEL_RECORD");
});

type HookModelField = {
  record: {
    model: {
      name: string;
    };
    name: string;
    label: string;
    type: "string" | "number";
  };
};

