import { Asset, AssetPreview } from "@shared/types";

export abstract class BaseWebsite {
  abstract search(query: string): Promise<AssetPreview[]>;
  abstract fetchAsset(id: string): Promise<Asset>;
}
