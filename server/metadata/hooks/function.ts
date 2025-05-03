import mercury from "@mercury-js/core";
import { addResolversFromDBToMercury } from "../utility";

mercury.hook.after("UPDATE_FUNCTION_RECORD", async function (this: any) {
    await addResolversFromDBToMercury();
});
