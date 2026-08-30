import { ItchIoAssetPreview } from "@shared/types";
import * as cheerio from "cheerio";

function buildItchIoSearchUrl(query: string): string {
  const facets = ["c.2"];
  const url = new URL(`https://itch.io/search`);
  url.searchParams.set("facets", facets.join(","));
  url.searchParams.set("type", "games");
  url.searchParams.set("q", query);

  return url.toString();
}

function itchIoUrlToId(url: string): string {
  return `itch.io|${new URL(url).hostname.split(".")[0]}|${url.split("/").pop()}`;
}

export async function searchOnItchIo(query: string): Promise<ItchIoAssetPreview[]> {
  const url = buildItchIoSearchUrl(query);
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch assets");
  const html = await response.text();
  const $ = cheerio.load(html);
  const results = $(".results_column div.game_cell");
  return results
    .map((i, el) => {
      const $el = $(el);
      const url = $el.find("a.title.game_link").attr("href");
      if (!url) throw new Error("Failed to parse url");

      const title = $el.find("a.title.game_link").text();
      const author = $el.find("div.game_author a").text();
      const image = $el.find("img.lazy_loaded").attr("data-lazy_src")?.endsWith(".gif")
        ? $el.find("div.gif_overlay").attr("data-gif")
        : $el.find("img.lazy_loaded").attr("data-lazy_src");
      return {
        title,
        author,
        url,
        slug: itchIoUrlToId(url),
        images: image ? [image] : [],
        id: itchIoUrlToId(url),
        _asset_source: "itch.io" as const
      };
    })
    .get();
}

export async function fetchItchIoAsset(url: string): Promise<ItchIoAssetPreview> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch assets");
  const html = await response.text();
  const $ = cheerio.load(html);
  const images = $("img.lazy_loaded")
    .map((i, el) =>
      $(el).attr("data-lazy_src")?.endsWith(".gif")
        ? $(el).attr("data-lazy_src")
        : $(el).attr("data-lazy_src")
    )
    .get();
  return {
    title: $("h1.game-title").text(),
    author: $("div.game_author a").text(),
    url,
    slug: itchIoUrlToId(url),
    images,
    id: itchIoUrlToId(url),
    _asset_source: "itch.io" as const
  };
}
