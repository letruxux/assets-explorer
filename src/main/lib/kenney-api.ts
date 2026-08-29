import { KenneyAsset } from "@shared/types";

export async function fetchAllKenneyAssets(): Promise<KenneyAsset[]> {
  const url =
    "https://github.com/letruxux/kenney-assets-registry/raw/refs/heads/main/data/all.json";
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch assets");
  return response.json() as unknown as KenneyAsset[];
}
