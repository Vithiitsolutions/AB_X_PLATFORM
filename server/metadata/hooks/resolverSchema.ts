import mercury from "@mercury-js/core";
import { addResolversFromDBToMercury } from "../utility";

mercury.hook.after("CREATE_RESOLVERSCHEMA_RECORD", async function (this: any) {
    await addResolversFromDBToMercury()
});

mercury.hook.after("UPDATE_RESOLVERSCHEMA_RECORD", async function (this: any) {
    await addResolversFromDBToMercury()
});

mercury.hook.after("DELETE_RESOLVERSCHEMA_RECORD", async function (this: any) {
    await addResolversFromDBToMercury()
});