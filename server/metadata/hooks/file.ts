import mercury from "@mercury-js/core";
import { Asset } from "../AssetService";

mercury.hook.before("CREATE_FILE_RECORD", async function (this) {
  const args = this?.options.args?.input || this?.options.args || this.data;
  const asset = new Asset();
  const response = await asset.uploadFile(
    args?.base64,
    args?.name,
    args?.extension
  );
  args.base64 = undefined;
  args.mediaId = response?.key;
  args.url = response?.path;
  args.mimeType = response?.mimeType;
  args.size = response?.size;
});

mercury.hook.before("DELETE_FILE_RECORD", async function (this) {
  const args = this?.options.args?.id || this?.record?.id;
  const asset = new Asset();
  const file: any = await mercury.db.File.get({ _id: args }, this.user);
  await asset.deleteFile(file.mediaId);
});

mercury.hook.before("UPDATE_FILE_RECORD", async function (this) {
  let args: any = this?.options.args?.input || this?.data;
  if (!Array.isArray(args)) {
    const asset = new Asset();
    const file: any = await mercury.db.File.get({ _id: args.id }, this.user);
    const response = await asset.updateFile(
      file?.mediaId,
      true,
      args.base64,
      args?.name || file?.name,
      args?.extension || file?.extension
    );

    args.base64 = undefined;
    args.mediaId = response?.key;
    args.url = response?.path;
    args.mimeType = response?.mimeType;
  } else {
    const asset = new Asset();
    const updatePromises = args.map(async (arg: any) => {
      const file: any = await mercury.db.File.get({ _id: arg.id }, this.user);
      const response = await asset.updateFile(
        file?.mediaId,
        true,
        arg.base64,
        arg?.name || file?.name,
        arg?.extension || file?.extension
      );
      return { arg, response };
    });

    const results = await Promise.all(updatePromises);

    args = results.map(({ arg, response }) => ({
      ...arg,
      base64: undefined,
      mediaId: response?.key,
      url: response?.path,
      mimeType: response?.mimeType,
    }));
    this.options.args.input = args;
  }
});
