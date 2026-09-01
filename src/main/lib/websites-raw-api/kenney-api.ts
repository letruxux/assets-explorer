import { buildId } from "@shared/types";
import { ItchIoAsset } from "./itch-io-api";

export type KenneyAsset = {
  title: string;
  meta: {
    Tags: Array<string>;
    Category: string;
    Series: string;
    "Tile size"?: string;
    Files: number;
    License: string;
    Features?: Array<string>;
  };
  updates: Array<{ name: string; description: string; date: string }>;
  _extracted: { createdAt: string; updatedAt: string; version: string };
  _raw_meta: {
    Tags: string;
    Category: string;
    "Tile size"?: string;
    Files: string;
    License: string;
    Features?: string;
  };
  slug: string;
  images: Array<string>;
  downloads: ItchIoAsset["downloads"];
  _asset_source: "kenney.nl";
  id: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformKenneyAsset(asset: any): KenneyAsset {
  return {
    ...asset,
    id: buildId("kenney.nl", asset.slug),
    _asset_source: "kenney.nl" as const,
    downloads: [
      {
        date: asset._extracted.updatedAt,
        name: asset.download_url.split("/").at(-1)!,
        url: asset.download_url,
        file_size: "N/A"
      }
    ]
  };
}

export async function fetchAllKenneyAssets(): Promise<KenneyAsset[]> {
  const url =
    "https://github.com/letruxux/kenney-assets-registry/raw/refs/heads/main/data/all.json";
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch assets");
  const base = (await response.json()) as unknown as KenneyAsset[];
  return base.map(transformKenneyAsset);
}

export async function fetchKenneyAsset(slug: string): Promise<KenneyAsset> {
  const url = `https://github.com/letruxux/kenney-assets-registry/raw/refs/heads/main/data/full/${slug}.json`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch assets");
  const base = (await response.json()) as unknown as KenneyAsset;
  return transformKenneyAsset(base);
}
