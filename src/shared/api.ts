import { AssetPreview, Asset, AssetsManifestType, SettingsType, InstalledFile } from "./types";

export type ApiType = {
  searchAssets(query: string, source: "kenney.nl" | "itch.io"): Promise<AssetPreview[]>;
  fetchAssetDetail(id: string): Promise<Asset>;
  getInstalledFiles(): Promise<AssetsManifestType["installedFiles"]>;
  downloadFile(asset: Asset, file: Asset["files"][number]): Promise<void>;
  readSettings(): Promise<SettingsType>;
  changeAssetsPath(): Promise<void>;
  readAssetsManifest(): Promise<AssetsManifestType | null>;
  openFileFolder(file: InstalledFile): Promise<void>;
  deleteFile(installedFile: InstalledFile): Promise<void>;
  testItchIo(): Promise<string>;
};
