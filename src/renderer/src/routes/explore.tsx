import { KenneyAsset } from "@shared/types";
import { useCallback, useMemo, useState } from "react";
import { cn } from "../lib/utils";
import { Link } from "react-router-dom";
import { useInstalledAssetIds } from "@renderer/hooks/use-installed-asset-ids";

function AssetCard({ result, query }: { result: KenneyAsset; query: string }): React.JSX.Element {
  const { installedAssetIds, refetch: refetchInstalledAssetIds } = useInstalledAssetIds();
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<Error | null>(null);

  const tagsInQuery = useMemo(
    () =>
      query
        .toLowerCase()
        .split(" ")
        .filter((e) => e.length > 0),
    [query]
  );

  const downloadCallback = useCallback(async () => {
    setDownloading(true);
    setDownloadError(null);

    try {
      await window.api.downloadAsset(result._asset_source, result.slug);
      await refetchInstalledAssetIds();
    } catch (error) {
      setDownloadError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setDownloading(false);
    }
  }, [result, refetchInstalledAssetIds]);

  return (
    <Link to={`/asset/${result._asset_source}/${result.slug}`}>
      <article
        className={cn("card w-full bg-base-100 shadow-sm card-border", {
          "border-green-400": installedAssetIds.includes(result.id)
        })}
      >
        <figure className="aspect-video overflow-hidden">
          <img src={result.images[0]} alt={result.title} className="h-full w-full object-cover" />
        </figure>
        <div className="card-body">
          <h2 className="card-title">{result.title}</h2>

          <div className="flex gap-x-2 w-full overflow-auto scrollbar-none hover:animate-scroll-on-hover">
            {result.meta.Tags.map((e) => (
              <span
                className={cn("badge", {
                  "badge-primary": tagsInQuery.includes(e.toLowerCase()),
                  "badge-dash": !tagsInQuery.includes(e.toLowerCase())
                })}
                key={e}
              >
                {e.toTitleCase()}
              </span>
            ))}
          </div>
          <div className="card-actions mt-2 flex justify-end">
            {downloadError && <span className="text-error-content">{downloadError.message}</span>}
            <button
              className="btn btn-square"
              disabled={installedAssetIds.includes(result.id) || downloading}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                downloadCallback();
              }}
            >
              {downloading ? "..." : "DL"}
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}

function Home(): React.JSX.Element {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<KenneyAsset[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const searchCallback = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const assets = await window.api.searchAssets(query);
      setResults(assets);
    } catch (error) {
      setError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setLoading(false);
    }
  }, [query]);

  return (
    <div className="min-h-dvh w-full">
      <header className="join w-full p-4">
        <input
          type="text"
          className="input join-item w-full"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button className="btn btn-primary join-item" onClick={searchCallback} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </header>

      {error && <p className="px-4 text-error">{error.message}</p>}

      <section className="grid grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-4 p-4">
        {results.map((result) => (
          <AssetCard key={result.id} result={result} query={query} />
        ))}
      </section>
    </div>
  );
}

export default Home;
