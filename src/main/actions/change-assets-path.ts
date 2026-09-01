import { dialog } from "electron";
import { getAssetsManifest } from "../lib/modules/assets-manifest";
import { settings } from "../lib/modules/settings";

export default async function changeAssetsPath(): Promise<void> {
  const res = await dialog.showOpenDialog({
    buttonLabel: "Select",
    properties: ["openDirectory"]
  });
  const path = res.filePaths[0];
  if (!path) return;

  settings.set("assetsPath", path);
  const manifest = getAssetsManifest();
  if (manifest) manifest.save();
}
