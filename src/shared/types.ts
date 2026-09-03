export const ASSET_SOURCES = ["kenney.nl", "itch.io", "sketchfab", "poly.pizza"] as const;
export type AssetSource = (typeof ASSET_SOURCES)[number];

export type Scored<T> = T & { __score: number };

export interface AssetPreview {
  /** what website this asset is from  */
  _asset_source: AssetSource;
  title: string;
  author?: string;
  /** page url, for user view */
  page_url: string;
  images: string[];
  /** generated with buildId() */
  id: string;
  tags: string[];
  price?: string;
}
export interface ChangelogEntry {
  name: string;
  date: string;
  page_url?: string;
  description?: string;
}
export interface AssetMetadata {
  tags?: string[];
  category?: string;
  series?: string;
  tile_size?: string;
  files?: number;
  license?: string;
  features?: string[];

  RatingValue?: number;
  RatingCount?: number;
  description?: string;

  [key: string]: unknown;
}
export interface AssetFile {
  /** asset name */
  name: string;
  /** when the file was uplaoded */
  date?: string;
  /** DIRECT download url */
  direct_url: string;
  /** download count */
  download_count?: number;
  /** file size, like "2 MB" */
  file_size?: string;
}
export interface Asset {
  /** what website this asset is from  */
  _asset_source: AssetSource;
  title: string;
  author: string;
  /** page url, for user view */
  page_url: string;
  images: string[];
  /** generated with buildId() */
  id: string;

  files: AssetFile[];

  /** updates  */
  changelog: ChangelogEntry[];

  createdAt: string;
  updatedAt: string;

  /** extra metadata, will be shown in table to the user. Some keys like Tags are rendered custom */
  metadata: AssetMetadata;
}

export interface SettingsType {
  assetsPath: string;
  sketchfabApiKey: string;
  polyPizzaApiKey: string;
}

export interface InstalledFile {
  file: Asset["files"][number];
  assetId: string;
  installPath: string;
  installDate: string;
}

export interface AssetsManifestType {
  cachedAssets: Asset[];
  installedFiles: InstalledFile[];
}

export function buildId(source: AssetSource, ...extra: string[]): string {
  return `${source}|${extra.join("|")}`;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function parseId(id: string) {
  const [source, ...extra] = id.split("|");

  switch (source) {
    case "kenney.nl":
      return {
        source: "kenney.nl",
        slug: extra[0],
        pageUrl: `https://www.kenney.nl/assets/${extra[0]}`
      };
    case "itch.io":
      return {
        source: "itch.io",
        author: extra[0],
        slug: extra[1],
        pageUrl: `https://${extra[0]}.itch.io/${extra[1]}`
      };
    case "sketchfab": {
      const fullSlug = `${extra[0]}-${extra[1]}`;
      return {
        source: "sketchfab",
        slug: fullSlug,
        assetId: extra[1],
        pageUrl: `https://sketchfab.com/3d-models/${fullSlug}`
      };
    }
    case "poly.pizza": {
      const id = extra[0];
      return {
        source: "poly.pizza",
        assetId: extra[0],
        pageUrl: `https://poly.pizza/m/${id}`
      };
    }
  }

  throw new Error("Unknown asset source");
}
