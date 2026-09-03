import { buildResponseNotOkError, USER_AGENT } from "../utils";
import * as cheerio from "cheerio";

export interface PolyPizzaAssetPreview {
  title: string;
  author: string;
  image: string;
  url: string;
}

export async function searchPolyPizza(query: string): Promise<PolyPizzaAssetPreview[]> {
  const url = `https://poly.pizza/search/${encodeURIComponent(query)}`;
  const resp = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT
    },
    method: "GET"
  });
  if (!resp.ok) throw await buildResponseNotOkError(resp);
  const html = await resp.text();
  const $ = cheerio.load(html);
  const results = $(".MuiGrid-item .MuiCard-root")
    .map((i, el) => {
      const $el = $(el);
      const price = $el.find(".MuiCardHeader-action").text().trim() || null;
      if (price) return null;
      const title = $el.find(".MuiCardHeader-title").text();
      let url = $el.find("a").attr("href")!;
      if (url.startsWith("/")) url = "https://poly.pizza" + url;
      const author = $el.find(".MuiCardHeader-subheader").text();
      const image = $el.find("img.w-full").attr("src")!;
      return {
        title,
        author,
        image,
        url
      };
    })
    .get()
    .filter((e) => e !== null);
  return results;
}
