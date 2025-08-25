import mercury from "@mercury-js/core";
import { metaServer } from "../../../server";

mercury.hook.before("CREATE_PACKAGE_RECORD", async function (this: any) {
  const packageName = this.options.args.input.name;

  if (!metaServer.packageInstaller.isValidPackageName(packageName)) {
    throw new Error(
      "Invalid package name. Package names must follow npm naming conventions and cannot contain dangerous characters."
    );
  }
});

mercury.hook.after("CREATE_PACKAGE_RECORD", async function (this: any) {
  if (this.options.skipHook) return;
  metaServer.packageInstaller.install({
    id: this.record.id,
    ...this.options.args.input,
  });
});

mercury.hook.after("DELETE_PACKAGE_RECORD", async function (this: any) {
  if (this.options.skipHook) return;
  metaServer.packageInstaller.uninstall(this.deletedRecord?.id);
});
