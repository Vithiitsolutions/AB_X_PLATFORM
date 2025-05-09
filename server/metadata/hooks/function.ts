import mercury from "@mercury-js/core";
import { addResolversFromDBToMercury, registerHooksFromDB } from "../utility";
import { metaServer } from "../../../server";

mercury.hook.after("UPDATE_FUNCTION_RECORD", async function (this: any) {
    await addResolversFromDBToMercury();
    await registerHooksFromDB();
    await metaServer.cronService.reload();
});
