import { Asset, AssetFile, AssetPreview } from "@shared/types";

export interface WebsiteCallConfig {
  avoidCache?: boolean;
}

export abstract class BaseWebsite {
  abstract search(query: string, config?: WebsiteCallConfig): Promise<AssetPreview[]>;
  abstract fetchAsset(id: string, config?: WebsiteCallConfig): Promise<Asset>;
  abstract fetchFeatured(): Promise<AssetPreview[]>;
  abstract fetchDownloads(id: string): Promise<AssetFile[]>;
}
