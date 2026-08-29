import Fuse from "fuse.js";
import { fetchAllKenneyAssets } from "./kenney-api";
import { searchOnItchIo } from "./itch-io-api";

export async function searchOnKenneyNl(query: string) {
  const all = await fetchAllKenneyAssets();
  const fuse = new Fuse(all, {
    keys: [
      { name: "title", weight: 2.0 },
      { name: "meta.tags", weight: 1 },
      { name: "meta.category", weight: 0.5 },
      { name: "meta.series", weight: 0.5 }
    ],
    includeScore: true
  });
  const result = fuse.search(query);
  return result.map((i) => ({ ...i.item, __score: i.score ? 1 - i.score : 0,
    _asset_source: "kenney.nl"
   })).filter((i) => i.__score > 0.3);
}

export { searchOnItchIo };

/* searchOnKenneyNl("city").then((a) => {
  for (const asset of a.filter((i) => i.__score < 0.8).toSorted((a, b) => a.__score - b.__score)) {
    console.log(asset.title, "-", Math.floor((1 - asset.__score) * 100).toString() + "%");
  }
});
 */

/* searchOnItchIo("explosion").then(console.log) */
