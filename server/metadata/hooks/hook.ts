import mercury from "@mercury-js/core";
import { registerHooksFromDB } from "../utility";

mercury.hook.after("CREATE_HOOKM_RECORD", async function (this: any) {
    await registerHooksFromDB()
});

mercury.hook.after("UPDATE_HOOKM_RECORD", async function (this: any) {
    await registerHooksFromDB()
});

mercury.hook.after("DELETE_HOOKM_RECORD", async function (this: any) {
    await registerHooksFromDB()
});


