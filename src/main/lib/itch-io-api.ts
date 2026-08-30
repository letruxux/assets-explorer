import { buildId, ItchIoAsset, ItchIoAssetPreview } from "@shared/types";
import * as cheerio from "cheerio";
import { writeFileSync } from "fs";

function buildItchIoSearchUrl(query: string): string {
  const facets = ["c.2"];
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

export async function fetchDownloadUrls(
  url: string,
  $: cheerio.CheerioAPI
): Promise<ItchIoAsset["downloads"]> {
  writeFileSync("MOCCCC.html", $.html());
  const csrfToken = $('meta[name="csrf_token"]').attr("value");
  if (!csrfToken) throw new Error("No csrf token found");

  const postUrl = `${url}/download_url`;
  const formData = new FormData();
  formData.append("csrf_token", csrfToken);
  const response = await fetch(postUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: formData
  });
  if (!response.ok) throw new Error("Failed to fetch url");
  const downloadPageUrl = (await response.json()) as { url: string };
  const downloadPageResp = await fetch(downloadPageUrl.url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36"
    }
  });
  if (!downloadPageResp.ok) throw new Error("Failed to fetch url");
  const $$ = cheerio.load(await downloadPageResp.text())("div.uploads .base-widget .upload");
  return await Promise.all(
    $$.map(async (_, el) => {
      const filename = $(el).find("upload_name strong").attr("title");
      const uploadId = $(el).find("a.button").attr("data-upload_id");
      const dateStr = weirdDateParser($(el).find(".upload_date abbr").attr("title") ?? "");
      if (!filename || !uploadId || !dateStr) throw new Error("Failed to parse download");

      const postDownloadUrl = `${url}/file/${uploadId}?source=game_download`;
      const formData = new FormData();
      formData.append("csrf_token", csrfToken);
      const dlResp = await fetch(postDownloadUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData
      });
      if (!dlResp.ok) throw new Error("Failed to fetch url");
      const finalUrl = ((await dlResp.json()) as { url: string }).url;
      return {
        name: filename,
        url: finalUrl,
        date: new Date(dateStr).toISOString()
      };
    }).get()
  );
}

export async function fetchItchIoAsset(url: string): Promise<ItchIoAsset> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch assets");
  const html = await response.text();
  const $ = cheerio.load(html);
  const vgPage = $(".view_game_page");
  const images = vgPage
    .find(".screenshot_list img")
    .map((i, el) => {
      return $(el).attr("src")!;
    })
    .get();

  const moreInfoTableRows = $(".info_panel_wrapper table tbody tr");
  const _raw_meta: Record<string, string> = {};
  const meta: ItchIoAsset["meta"] = {
    Description: $('meta[name="description"]').attr("content")
  };
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
          .map((i, el) => $(el).text())
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
    .map((i, el) => {
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
  return {
    title: $("title").text(),
    author: $("div.game_author a").text(),
    url,
    slug: itchIoUrlToId(url),
    images,
    id: itchIoUrlToId(url),
    _asset_source: "itch.io" as const,
    downloads,
    meta,
    _extracted,
    updates
  } satisfies ItchIoAsset;
}
