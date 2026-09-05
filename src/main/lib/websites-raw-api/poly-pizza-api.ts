import { settings } from "../modules/settings";
import { buildResponseNotOkError } from "../utils";

export interface PolypizzaSearchResponse {
  total: number;
  results: Array<{
    ID: string;
    Title: string;
    Description?: string;
    Attribution: string;
    Thumbnail: string;
    Download: string;
    TriCount: number;
    Creator: {
      Username: string;
      DPURL: string;
    };
    Category: string;
    Tags: string[];
    Licence: string;
    Animated: boolean;
  }>;
}

export type PolyPizzaAssetPreview = NonNullable<PolypizzaSearchResponse["results"][number]>;

export async function searchPolyPizza(
  query: string,
  options?: {
    limit?: number;
    page?: number;
    category?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
    license?: 0 | 1;
    animated?: 0 | 1;
  }
): Promise<PolyPizzaAssetPreview[]> {
  const params = new URLSearchParams();
  if (options?.limit) params.append("Limit", String(options.limit));
  if (options?.page) params.append("Page", String(options.page));
  if (options?.category !== undefined) params.append("Category", String(options.category));
  if (options?.license !== undefined) params.append("License", String(options.license));
  if (options?.animated !== undefined) params.append("Animated", String(options.animated));

  const url = `https://api.poly.pizza/v1.1/search/${encodeURIComponent(query)}?${params.toString()}`;
  const response = await fetch(url, {
    headers: {
      "x-auth-token": settings.getOrError("polyPizzaApiKey")
    }
  });
  if (!response.ok) throw await buildResponseNotOkError(response);
  const json = await response.json();
  return json.results;
}

export async function getFeatured(): Promise<PolyPizzaAssetPreview[]> {
  const params = new URLSearchParams();
  params.append("Limit", "5");
  params.append("License", "1");

  const url = `https://api.poly.pizza/v1.1/search?${params.toString()}`;
  const response = await fetch(url, {
    headers: {
      "x-auth-token": settings.getOrError("polyPizzaApiKey")
    }
  });
  if (!response.ok) throw await buildResponseNotOkError(response);
  const json = await response.json();
  return json.results;
}

export interface PolyPizzaAsset {
  ID: string;
  Title: string;
  Description?: string;
  Attribution: string;
  Thumbnail: string;
  Download: string;
  TriCount: number;
  Creator: {
    Username: string;
    DPURL: string;
  };
  Uploaded: string;
  Category: string;
  Licence: string;
  Animated: boolean;
}

export async function fetchPolyPizzaModel(id: string): Promise<PolyPizzaAsset> {
  const response = await fetch(`https://api.poly.pizza/v1.1/model/${id}`, {
    headers: {
      "x-auth-token": settings.getOrError("polyPizzaApiKey")
    }
  });
  if (!response.ok) throw await buildResponseNotOkError(response);
  return response.json();
}
