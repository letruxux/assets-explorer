import { ASSET_SOURCES, AssetSource } from "@shared/types";
import { useCallback, useEffect } from "react";
import { AssetCard } from "@renderer/components/asset-card";
import { useSearchStore } from "@renderer/store/search";

function Home(): React.JSX.Element {
  const query = useSearchStore((s) => s.query);
  const source = useSearchStore((s) => s.source);
  const results = useSearchStore((s) => s.results);
  const loading = useSearchStore((s) => s.loading);
  const error = useSearchStore((s) => s.error);

  const setQuery = useSearchStore((s) => s.setQuery);
  const setSource = useSearchStore((s) => s.setSource);
  const setResults = useSearchStore((s) => s.setResults);
  const setLoading = useSearchStore((s) => s.setLoading);
  const setError = useSearchStore((s) => s.setError);
  const setScroll = useSearchStore((s) => s.setScroll);

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
      <header className="join w-full p-4">
        <input
          type="text"
          className="input join-item w-full"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <select
          value={source}
          className="select appearance-none join flex items-center"
          onChange={(e) => setSource(e.target.value as AssetSource)}
        >
          {ASSET_SOURCES.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>

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
