import { buildId, parseId } from "@shared/types";
import * as cheerio from "cheerio";
import { buildResponseNotOkError, USER_AGENT } from "@lib/utils";
import { fetchWithElectronBrowser } from "@lib/cf-solve";

export type ItchIoAssetPreview = {
  title: string;
  author: string;
  url: string;
  images: string[];
  id: string;
  slug: string; /* same as id */
  price: string | null;
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

function buildItchIoSearchUrl(query: string): string {
  const facets = [
    "c.2"
  ]; /* "m.free" is not available because we need to login... but login is coming soon anyway */
  const url = new URL(`https://itch.io/search`);
  url.searchParams.set("facets", facets.join(","));
  url.searchParams.set("type", "games");
  url.searchParams.set("q", query);

  return url.toString();
}

function itchIoUrlToId(url: string): string {
  const author = new URL(url).hostname.split(".")[0];
  const slug = url.split("/").pop()!;
  return buildId("itch.io", author, slug);
}

function weirdDateParser(date: string): string {
  return new Date(date.replace(" @ ", " ")).toISOString();
}

export async function searchOnItchIo(query: string): Promise<ItchIoAssetPreview[]> {
  const url = buildItchIoSearchUrl(query);
  const html = await fetchWithElectronBrowser(url);
  const $ = cheerio.load(html);
  const results = $(".results_column div.game_cell");
  return results
    .map((_, el) => {
      const $el = $(el);
      const url = $el.find("a.title.game_link").attr("href");
      if (!url) throw new Error("Failed to parse url");
      const price = $el.find(".price_value").length ? $el.find(".price_value").text() : null;

      const title = $el.find("a.title.game_link").text();
      const author = $el.find("div.game_author a").text();
      const image = $el.find("img.lazy_loaded").attr("data-lazy_src")?.endsWith(".gif")
        ? $el.find("div.gif_overlay").attr("data-gif")
        : $el.find("img.lazy_loaded").attr("data-lazy_src");
      return {
        title,
        author,
        url,
        price,
        slug: itchIoUrlToId(url),
        images: image ? [image] : [],
        id: itchIoUrlToId(url),
        _asset_source: "itch.io" as const
      };
    })
    .get();
}

export async function fetchDownloadUrls(
  url: string,
  $: cheerio.CheerioAPI
): Promise<ItchIoAsset["downloads"]> {
  const csrfToken = $('meta[name="csrf_token"]').attr("value");
  if (!csrfToken) throw new Error("No csrf token found");

  const postUrl = `${url}/download_url`;
  const formData = new FormData();
  formData.append("csrf_token", csrfToken);
  const response = await fetch(postUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": USER_AGENT
    },
    body: formData
  });
  if (!response.ok) throw await buildResponseNotOkError(response);
  const downloadPageUrl = (await response.json()) as { url?: string; errors?: string[] };
  if ((downloadPageUrl.errors ?? []).length > 0 || !downloadPageUrl.url) {
    console.error(downloadPageUrl.errors?.join(", "));
    return [];
  }

  const downloadPageResp = await fetch(downloadPageUrl.url, {
    headers: {
      "User-Agent": USER_AGENT
    }
  });
  if (!downloadPageResp.ok) throw await buildResponseNotOkError(downloadPageResp);
  console.log("Download page loaded");
  const $$ = cheerio.load(await downloadPageResp.text())(".upload");
  console.log("Found", $$.length, "downloads");
  return await Promise.all(
    $$.map(async (_, el) => {
      const filename = $(el).find(".upload_name strong").attr("title");
      const uploadId = $(el).find("a.button").attr("data-upload_id");
      const dateStr = weirdDateParser($(el).find(".upload_date abbr").attr("title") ?? "");
      const file_size = $(el).find(".file_size").text().trim();
      if (!filename || !uploadId || !dateStr) throw new Error("Failed to parse download");

      const postDownloadUrl = `${url}/file/${uploadId}?source=game_download`;
      const formData = new FormData();
      formData.append("csrf_token", csrfToken);
      const dlResp = await fetch(postDownloadUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": USER_AGENT
        },
        body: formData
      });
      if (!dlResp.ok) throw await buildResponseNotOkError(dlResp);
      const finalUrl = ((await dlResp.json()) as { url: string }).url;
      return {
        file_size,
        name: filename,
        url: finalUrl,
        date: new Date(dateStr).toISOString()
      };
    }).get()
  );
}

export async function fetchItchIoAsset(url: string): Promise<ItchIoAsset> {
  const response = await fetch(url);
  if (!response.ok) throw await buildResponseNotOkError(response);
  const html = await response.text();
  const $ = cheerio.load(html);
  const vgPage = $(".view_game_page");
  const images = vgPage
    .find(".screenshot_list img")
    .map((_, el) => {
      return $(el).attr("src")!;
    })
    .get();

  const moreInfoTableRows = $(".info_panel_wrapper table tbody tr");
  const _raw_meta: Record<string, string> = {};
  async function getRatingValue(): Promise<number> {
    const ldJsons = $("script[type='application/ld+json']");
    const ldJson = ldJsons.filter((_, el) => {
      const $el = $(el);
      return $el.text().includes('ratingValue":');
    });
    const parsed = JSON.parse(ldJson.text());
    return Number(parsed.aggregateRating.ratingValue);
  }
  /// @ts-ignore mustard
  const meta: ItchIoAsset["meta"] = {
    Description: $('meta[name="description"]').attr("content"),
    RatingValue: await getRatingValue().catch(() => 0)
  };
  /// @ts-ignore mustard
  const _extracted: ItchIoAsset["_extracted"] = {};
  for (const row of moreInfoTableRows) {
    const key = $(row).find("td:first-child").text()!;
    const valCell = $(row).find("td:last-child");
    _raw_meta[key] = valCell.html()!;

    switch (key) {
      case "Updated":
        _extracted["updatedAt"] = weirdDateParser(valCell.find("abbr").attr("title")!);
        break;
      case "Published":
        _extracted["createdAt"] = weirdDateParser(valCell.find("abbr").attr("title")!);
        break;
      case "Tags":
        meta.Tags = $(valCell)
          .find("a")
          .map((_, el) => $(el).text())
          .get();
        break;
      case "Asset license":
        meta.License = $(valCell).text().trim();
        break;
      case "Rating":
        meta.RatingCount = Number($(valCell).find(".rating_count").attr("content") || "0");
        break;
      default:
        meta[key] = $(valCell).text();
        break;
    }
  }

  const updates = $("#devlog ul li")
    .map((_, el) => {
      const $el = $(el);
      const date = weirdDateParser($el.find(".post_date abbr").attr("title")!);
      const name = $el.find("a").text();
      const url = $el.find("a").attr("href")!;
      return {
        name,
        url,
        date
      };
    })
    .get();

  const downloads = await fetchDownloadUrls(url, $);
  const id = itchIoUrlToId(url);
  return {
    title: $("title").text(),
    author: parseId(id).author!,
    url,
    slug: id,
    images,
    id,
    _asset_source: "itch.io" as const,
    downloads,
    meta,
    _extracted,
    updates
  } satisfies ItchIoAsset;
}
