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

export type ItchIoAssetPreview = {
  title: string;
  author: string;
  url: string;
  images: string[];
  id: string;
  slug: string; /* same as id */
  _asset_source: "itch.io";
};

export type ItchIoAsset = {
  title: string;
  author: string;
  url: string;
  images: string[];
  id: string;
  slug: string; /* same as id */
  _asset_source: "itch.io";

  downloads: {
    date: string;
    name: string;
    url: string;
    file_size: string;
  }[];

  meta: {
    RatingValue: number;
    RatingCount: number;
    Tags: string[];
    Description?: string;
    License: string;
  };
  updates: Array<{ name: string; url: string; date: string }>;
  _extracted: {
    createdAt: string;
    updatedAt: string;
  };
};

export const ASSET_SOURCES = ["kenney.nl", "itch.io"] as const;
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
}

export interface AssetMetadata {
  tags?: string[];
  category?: string;
  series?: string;
  tile_size?: string;
  files?: number;
  license?: string;
  features?: string[];

  rating_value?: number;
  rating_count?: number;
  description?: string;

  [key: string]: unknown;
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

  files: {
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
  }[];

  /** updates  */
  changelog: {
    name: string;
    date: string;
    page_url?: string;
  }[];

  createdAt: string;
  updatedAt: string;

  /** extra metadata, will be shown in table to the user. Some keys like Tags are rendered custom */
  metadata: AssetMetadata;
}

export interface SettingsType {
  assetsPath: string;
}

export interface AssetsManifestType {
  installedAssets: {
    installPath: string;
    installDate: string;
    cachedAsset: Asset;
  }[];
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
  }

  throw new Error("Unknown asset source");
}
