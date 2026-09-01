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
