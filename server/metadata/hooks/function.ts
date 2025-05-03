import mercury from "@mercury-js/core";
import { addResolversFromDBToMercury, registerHooksFromDB } from "../utility";

mercury.hook.after("UPDATE_FUNCTION_RECORD", async function (this: any) {
    await addResolversFromDBToMercury();
    await registerHooksFromDB();
});
