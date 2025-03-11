import mercury from "@mercury-js/core";
import { metaEvents } from "../Events.ts";

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

mercury.hook.after("CREATE_MODELFIELD_RECORD", function (this: HookModelField) {
  console.log("Model Record Updated: ", this);
  // mercury.deleteModel(this.record.model.name);
  mercury.createModel(
    this.record.model.name,
    {
      [this.record.name]: {
        type: this.record.type,
      },
    },
    {
      historyTracking: false,
      update: true,
    }
  );
  // mercury.createModel("Employee", {
  //   name: {
  //     type: "string",
  //   },
  //   age: {
  //     type: "number",
  //   },
  // }, {
  //   historyTracking: true,
  // })

  metaEvents.emit("CREATE_MODEL_RECORD");
});
