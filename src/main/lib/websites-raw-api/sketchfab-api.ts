import { buildId } from "@shared/types";
import { buildResponseNotOkError } from "../utils";
import { settings } from "../modules/settings";

type SketchfabFetchAssetResponse = {
  uid?: string;
  publishedAt?: string;
  likeCount?: number;
  commentCount?: number;
  updatedAt?: string;
  isDownloadable?: boolean;
  isAgeRestricted?: boolean;
  pbrType?: string;
  materialCount?: number;
  name?: string;
  source?: string;
  staffpickedAt?: string | null;
  createdAt?: string;
  embedUrl?: string;
  status?: object;
  description?: string | null;
  tags?: {
    name: string;
    slug?: string;
    uri?: string;
  }[];
  viewerUrl?: string;
  isProtected?: boolean;
  price?: number;
  textureCount?: number;
  vertexCount?: number;
  user?: {
    username?: string;
    profileUrl?: string;
    account?: string;
    displayName?: string;
    uid?: string;
    uri?: string;
    avatar?: {
      images?: {
        url?: string;
        width?: number;
        height?: number;
        size?: number;
      }[];
      uid?: string;
      uri?: string;
    };
  };
  categories?: {
    uri?: string;
    uid?: string;
    name?: string;
    slug?: string;
  }[];
  animationCount?: number;
  viewCount?: number;
  thumbnails?: {
    images?: {
      url?: string;
      width?: number;
      size?: number | null;
      uid?: string;
      height?: number;
    }[];
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  license?: any;
  editorUrl?: string;
  soundCount?: number;
  uri?: string;
  faceCount?: number;
  hasCommentsDisabled?: boolean;
  downloadCount?: number;
};

interface SketchfabSearchResponse {
  results?: {
    uid?: string;
    animationCount?: number;
    viewerUrl?: string;
    publishedAt?: string;
    likeCount?: number;
    commentCount?: number;
    user?: {
      username?: string;
      profileUrl?: string;
      account?: string;
      displayName?: string;
      uid?: string;
      uri?: string;
      avatar?: {
        images?: {
          url?: string;
          width?: number;
          height?: number;
          size?: number;
        }[];
        uid?: string;
        uri?: string;
      };
    };
    isDownloadable?: boolean;
    name?: string;
    viewCount?: number;
    thumbnails?: {
      images?: {
        url?: string;
        width?: number;
        size?: number | null;
        uid?: string;
        height?: number;
      }[];
    };
    license?: string;
    isPublished?: boolean;
    staffpickedAt?: string | null;
    archives?: {
      source?: ArchiveNested;
      glb?: ArchiveNested;
      usdz?: ArchiveNested;
      gltf?: ArchiveNested;
    };
    tags?: {
      name: string;
    }[];
    embedUrl?: string;
  }[];
}

type RawImages = NonNullable<NonNullable<SketchfabFetchAssetResponse["thumbnails"]>["images"]>;

function _fixImages(images: RawImages): RawImages {
  if (images.length === 0) return [];

  const best = images.reduce((best, current) => {
    return current.height! * current.width! > best.height! * best.width! ? current : best;
  });

  return [best];
}

type RawSketchfabAssetPreview = NonNullable<SketchfabSearchResponse["results"]>[number];
export type SketchfabAssetPreview = RawSketchfabAssetPreview & {
  _asset_source: "sketchfab";
  id: string;
};

type RawSketchfabAsset = SketchfabFetchAssetResponse;
export type SketchfabAsset = RawSketchfabAsset & {
  _asset_source: "sketchfab";
  id: string;
  shortUrl: string;
  downloads: {
    [key: string]: {
      size?: number;
      url: string;
      expires: number;
    };
  };
};

interface ArchiveNested {
  faceCount?: number;
  textureCount?: number;
  size?: number;
  vertexCount?: number;
  textureMaxResolution?: number;
}

function _fixAssetPreview(asset: RawSketchfabAssetPreview): SketchfabAssetPreview {
  const slug = new URL(asset.viewerUrl!).pathname.split("/").pop()!;
  const slugWithoutId = slug.replace("-" + asset.uid!, "");
  return {
    ...asset,
    _asset_source: "sketchfab",
    id: buildId("sketchfab", slugWithoutId, asset.uid!),
    thumbnails: asset.thumbnails
      ? {
          ...asset.thumbnails,
          images: _fixImages(asset.thumbnails.images ?? [])
        }
      : undefined
  } satisfies SketchfabAssetPreview;
}

function _fixAsset(asset: SketchfabFetchAssetResponse): SketchfabAsset {
  const slug = new URL(asset.viewerUrl!).pathname.split("/").pop()!;
  const slugWithoutId = slug.replace("-" + asset.uid!, "");
  return {
    ...asset,
    _asset_source: "sketchfab",
    id: buildId("sketchfab", slugWithoutId, asset.uid!),
    thumbnails: asset.thumbnails
      ? {
          ...asset.thumbnails,
          images: _fixImages(asset.thumbnails.images ?? [])
        }
      : undefined
  } as SketchfabAsset;
}

export async function search(q: string): Promise<SketchfabAssetPreview[]> {
  const resp = await fetch(
    `https://api.sketchfab.com/v3/search?type=models&downloadable=true&q=${encodeURIComponent(q)}&archives_flavours=false`,
    {
      headers: {
        accept: "application/json"
      },
      body: null,
      method: "GET"
    }
  );
  if (!resp.ok) throw await buildResponseNotOkError(resp);
  const json = (await resp.json()) as SketchfabSearchResponse;
  const results = json.results ?? [];
  return results.map(_fixAssetPreview);
}

export async function getFeatured(): Promise<SketchfabAssetPreview[]> {
  const resp = await fetch(
    `https://api.sketchfab.com/v3/models?sort_by=-createdAt&staffpicked=true&archives_flavours=false`,
    {
      headers: {
        accept: "application/json"
      },
      body: null,
      method: "GET"
    }
  );
  if (!resp.ok) throw await buildResponseNotOkError(resp);
  const json = (await resp.json()) as SketchfabSearchResponse;
  const results = json.results ?? [];
  return results.map(_fixAssetPreview);
}

export async function fetchAsset(id: string): Promise<SketchfabAsset> {
  const [resp, shareResp] = await Promise.all([
    fetch(`https://api.sketchfab.com/v3/models/${id}`, {
      headers: {
        accept: "application/json"
      },
      body: null,
      method: "GET"
    }),
    fetch(`https://sketchfab.com/i/models/${id}/sharing`)
  ]);

  if (!resp.ok) throw await buildResponseNotOkError(resp);
  const json = _fixAsset(await resp.json()) as SketchfabAsset;

  if (!shareResp.ok) throw await buildResponseNotOkError(shareResp);
  const shareJson = (await shareResp.json()) as {
    shortUrl: string;
  };

  return { ...json, downloads: {}, shortUrl: shareJson.shortUrl };
}

export async function verifySketchfabApiKey(key: string): Promise<boolean> {
  const resp = await fetch("https://api.sketchfab.com/v3/me/likes", {
    headers: {
      accept: "application/json",
      Authorization: `Token ${key}`
    }
  });
  if (!resp.ok) return false;
  return true;
}

export async function fetchAssetDownloads(id: string): Promise<SketchfabAsset["downloads"]> {
  const downloadsResp = await fetch(`https://api.sketchfab.com/v3/models/${id}/download`, {
    headers: {
      accept: "application/json",
      Authorization: `Token ${settings.get("sketchfabApiKey")}`
    },
    body: null,
    method: "GET"
  });
  if (!downloadsResp.ok) throw await buildResponseNotOkError(downloadsResp);
  return (await downloadsResp.json()) as SketchfabAsset["downloads"];
}
