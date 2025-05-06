import jwt from "jsonwebtoken";

export class Asset {
  authorization: string;
  BUCKET_NAME: string;
  API_KEY: string;
  APP_SECRET: string;
  FOLDER_NAME: string;
  ASSET_ENDPOINT: string;
  constructor() {
    this.authorization = this.getAuthorization();
  }
  getAuthorization() {
    this.API_KEY = Deno.env.get("MERCURY_ASSET_API_KEY");
    this.BUCKET_NAME = Deno.env.get("MERCURY_ASSET_BUCKET_NAME");
    this.APP_SECRET = Deno.env.get("MERCURY_ASSET_APP_SECRET");
    this.ASSET_ENDPOINT = Deno.env.get("MERCURY_ASSET_ENDPOINT");
    this.FOLDER_NAME = Deno.env.get("MERCURY_ASSET_FOLDER_NAME");

    const token = jwt.sign(
      { eat: Math.floor(Date.now() / 1000) + 10 * 60 },
      this.APP_SECRET,
      {
        algorithm: "HS256",
      }
    );
    return token;
  }
  async uploadFile(base64: string, fileName: string, extension: string) {
    const base64Parts = base64.split(";base64,");
    const mimeType = base64Parts[0].split(":")[1];
    const base64Data = base64Parts[1];

    const buffer = Buffer.from(base64Data, "base64");
    const byteArray = new Uint8Array(buffer);
    const blob = new Blob([byteArray], { type: mimeType });
    const file = new File([blob], `${fileName}.${extension}`, {
      type: mimeType,
    });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", `${this.FOLDER_NAME}`);

    let response: any = await fetch(
      `${this.ASSET_ENDPOINT}/${this.BUCKET_NAME}/upload`,
      {
        method: "POST",
        headers: {
          Authorization: this.authorization,
          "x-api-key": this.API_KEY,
        },
        body: formData,
      }
    );
    response = await response.json();
    let finalFileData = await this.generateSingedUrl(response?.object?.key);
    finalFileData.path = `${this.ASSET_ENDPOINT}${finalFileData?.path}`;
    finalFileData.size = response?.object?.size;
    finalFileData.mimeType = mimeType;
    return finalFileData;
  }
  async generateSingedUrl(key: string) {
    const formData = new FormData();
    formData.append("key", key);
    formData.append("eat", "-1");

    const response = await fetch(
      `${this.ASSET_ENDPOINT}/${this.BUCKET_NAME}/get-signed-url`,
      {
        method: "POST",
        headers: {
          Authorization: this.authorization,
          "x-api-key": this.API_KEY,
        },
        body: formData,
      }
    );
    return await response.json();
  }
  async deleteFile(key: string) {
    const response = await fetch(
      `${this.ASSET_ENDPOINT}/${this.BUCKET_NAME}/file/${key}`,
      {
        method: "DELETE",
        headers: {
          Authorization: this.authorization,
          "x-api-key": this.API_KEY,
        },
      }
    );
    return await response.json();
  }

  async updateFile(
    key: string,
    upsert = true,
    base64: string,
    fileName: string,
    extension: string
  ) {
    const base64Parts = base64.split(";base64,");
    const mimeType = base64Parts[0].split(":")[1];
    const base64Data = base64Parts[1];

    const buffer = Buffer.from(base64Data, "base64");
    const byteArray = new Uint8Array(buffer);
    const blob = new Blob([byteArray], { type: mimeType });
    const file = new File([blob], `${fileName}.${extension}`, {
      type: mimeType,
    });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("key", key);
    formData.append("upsert", String(upsert));

    let response: any = await fetch(
      `${this.ASSET_ENDPOINT}/${this.BUCKET_NAME}/file`,
      {
        method: "PUT",
        headers: {
          Authorization: this.authorization,
          "x-api-key": this.API_KEY,
        },
        body: formData,
      }
    );
    response = await response.json();
    let finalFileData = await this.generateSingedUrl(key);
    finalFileData.path = `${this.ASSET_ENDPOINT}${finalFileData?.path}`;
    finalFileData.mimeType = mimeType;
    return finalFileData;
  }
}
