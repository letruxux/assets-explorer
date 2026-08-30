import { Asset } from "@shared/types";
import { useCallback, useState } from "react";
import { AssetCard } from "@renderer/components/asset-card";

function Home(): React.JSX.Element {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Asset[]>([]);
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
