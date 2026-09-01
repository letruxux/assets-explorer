import { itchIoWebsite } from "@main/lib/websites/itchio-website";

export default async function testItchIo(): Promise<string> {
  const result = await itchIoWebsite.search("asset");
  if (result.length === 0) {
    throw new Error("No assets found");
  }
  return `itch.io works! ${result.length} assets found.`;
}
