import { ASSET_SOURCES, AssetSource } from "@shared/types";
import { useCallback, useEffect } from "react";
import { AssetCard } from "@renderer/components/asset-card";
import { useSearchStore } from "@renderer/store/search";
import useResult from "@renderer/hooks/use-result";

function Home(): React.JSX.Element {
  const {
    error,
    loading,
    query,
    results,
    setQuery,
    setResults,
    setLoading,
    setError,
    setScroll,
    source,
    setSource,
    hidePaidAssets,
    setHidePaidAssets
  } = useSearchStore();

  const { data: featured } = useResult(
    useCallback(async () => {
      const assets = await window.api.getFeatured();
      return assets;
    }, [])
  );

  useEffect(() => {
    window.scrollTo(useSearchStore.getState().scroll.x, useSearchStore.getState().scroll.y);
  }, []);

  useEffect(() => {
    const onScroll = (): void => {
      setScroll({ x: window.scrollX, y: window.scrollY });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [setScroll]);

  const searchCallback = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const assets = await window.api.searchAssets(query, source);
      setResults(assets);
    } catch (error) {
      setError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setLoading(false);
    }
  }, [query, source, setLoading, setError, setResults]);

  return (
    <div className="min-h-dvh w-full">
      <div>
        <header className="flex flex-col gap-2 p-4 sm:flex-row">
          <input
            type="text"
            className="input flex-1 min-w-0 w-full py-3 sm:py-0"
            placeholder="Search"
            value={query}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                searchCallback();
              }
            }}
            onChange={(e) => setQuery(e.target.value)}
          />

          <select
            value={source}
            className="select appearance-none shrink-0 sm:w-auto w-full"
            onChange={(e) => setSource(e.target.value as AssetSource)}
          >
            {ASSET_SOURCES.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>

          <button className="btn btn-primary shrink-0" onClick={searchCallback} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </header>
        <div className="flex px-4 justify-end">
          <label className="label">
            <input
              type="checkbox"
              onChange={(e) => {
                setHidePaidAssets(e.target.checked);
              }}
              checked={hidePaidAssets}
              className="checkbox"
            />
            Hide paid assets
          </label>
        </div>
      </div>

      {error && <p className="px-4 text-error">{error.message}</p>}

      {results.length > 0 && (
        <section className="grid grid-cols-[repeat(auto-fit,minmax(min(16rem,100%),1fr))] gap-4 p-4">
          {results
            .filter((e) => !hidePaidAssets || e.price === undefined)
            .map((result) => (
              <AssetCard key={result.id} result={result} query={query} />
            ))}
        </section>
      )}
      {results.length === 0 && query === "" && (
        <div>
          <div className="h-32 flex items-center justify-center w-full text-base-content/70">
            Start searching!
          </div>
          <h2 className="px-4 font-bold text-xl">Featured</h2>
          <section className="grid grid-cols-[repeat(auto-fit,minmax(min(16rem,100%),1fr))] gap-4 p-4">
            {(featured ?? [])
              .filter((e) => !hidePaidAssets || e.price === undefined)
              .map((result) => (
                <AssetCard key={result.id} result={result} query={query} />
              ))}
          </section>
        </div>
      )}
    </div>
  );
}

export default Home;
