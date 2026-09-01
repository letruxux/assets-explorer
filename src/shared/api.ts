import {
  AssetPreview,
  Asset,
  AssetsManifestType,
  SettingsType,
  InstalledFile,
  AssetSource,
  AssetFile
} from "./types";

export type ApiType = {
  searchAssets(query: string, source: AssetSource): Promise<AssetPreview[]>;
  fetchAssetDetail(id: string): Promise<Asset>;
  getInstalledFiles(): Promise<InstalledFile[]>;
  downloadFile(asset: Asset, file: AssetFile): Promise<void>;
  readSettings(): Promise<SettingsType>;
  changeAssetsPath(): Promise<void>;
  readAssetsManifest(): Promise<AssetsManifestType | null>;
  openFileFolder(file: InstalledFile): Promise<void>;
  deleteFile(installedFile: InstalledFile): Promise<void>;
  testItchIo(): Promise<string>;
};

export const API_CHANNELS = [
  "searchAssets",
  "fetchAssetDetail",
  "getInstalledFiles",
  "downloadFile",
  "readSettings",
  "changeAssetsPath",
  "readAssetsManifest",
  "openFileFolder",
  "deleteFile",
  "testItchIo"
] as const satisfies Array<keyof ApiType>;

type AssertAllApiChannelsIncluded =
  Exclude<keyof ApiType, (typeof API_CHANNELS)[number]> extends never ? true : never;

/* this is intentionally not used because it errors on typechecking */
const apiChannelsNotUpdated: AssertAllApiChannelsIncluded = true;
console.debug(apiChannelsNotUpdated);
