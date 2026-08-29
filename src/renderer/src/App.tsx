import { KenneyAsset } from "@shared/types";
import { useCallback, useEffect, useState } from "react";
import { cn } from "./lib/utils";

function App(): React.JSX.Element {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<KenneyAsset[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handlePong = (): void => {
      console.log("pongawdwda");
    };

    window.electron.ipcRenderer.on("pong", handlePong);

    return () => {
      window.electron.ipcRenderer.removeListener("pong", handlePong);
    };
  }, []);

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
      <header className="join w-full p-2">
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

      {error && <p className="px-2 text-error">{error.message}</p>}

      <section className="grid grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-4 p-2">
        {results.map((result, index) => (
          <article
            key={result.slug ?? index}
            className="card w-full bg-base-100 shadow-sm card-border"
          >
            <figure className="aspect-video overflow-hidden">
              <img
                src={result.images[0]}
                alt={result.title}
                className="h-full w-full object-cover"
              />
            </figure>

            <div className="card-body">
              <h2 className="card-title">{result.title}</h2>

              <div className="flex gap-x-2 w-full overflow-auto scrollbar-none">
                {result.meta.Tags.map((e) => (
                  <span
                    className={cn("badge", {
                      "badge-primary": query.split(" ").includes(e),
                      "badge-dash": !query.split(" ").includes(e)
                    })}
                    key={e}
                  >
                    {e}
                  </span>
                ))}
              </div>
{/*
              <div className="card-actions justify-end">
                <button className="btn btn-primary">View</button>
              </div> */}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export default App;
