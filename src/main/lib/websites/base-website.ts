import { Asset, AssetPreview } from "@shared/types";

export abstract class BaseWebsite {
  abstract search(query: string, config: { avoidCache: boolean }): Promise<AssetPreview[]>;
  abstract fetchAsset(id: string, config: { avoidCache: boolean }): Promise<Asset>;
}
