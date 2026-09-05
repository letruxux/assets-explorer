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
  checkForDeletedFiles(): Promise<{
    found: number;
    deletedFiles: InstalledFile[];
  }>;
  setSetting(key: keyof SettingsType, value: SettingsType[keyof SettingsType]): Promise<void>;
  deleteStaleDatabaseEntries(files: InstalledFile[]): Promise<number>;
  getFeatured(): Promise<AssetPreview[]>;
  open(path: string): Promise<void>;
  getVersion(): Promise<{ name: string; version: string }>;
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
  "testItchIo",
  "checkForDeletedFiles",
  "deleteStaleDatabaseEntries",
  "setSetting",
  "getFeatured",
  "open",
  "getVersion"
] as const satisfies Array<keyof ApiType>;

type AssertAllApiChannelsIncluded =
  Exclude<keyof ApiType, (typeof API_CHANNELS)[number]> extends never ? true : never;

/* this is intentionally not used because it errors on typechecking */
const apiChannelsNotUpdated: AssertAllApiChannelsIncluded = true;
console.debug(apiChannelsNotUpdated);
