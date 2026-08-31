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
