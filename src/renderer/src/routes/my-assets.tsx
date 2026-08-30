import { AssetCard } from "@renderer/components/asset-card";
import { AssetsManifestType } from "@shared/types";
import { useState, useEffect } from "react";

function About(): React.JSX.Element {
  const [assetsManifest, setAssetsManifest] = useState<AssetsManifestType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadAssetsManifest(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const assetsManifest = await window.api.readAssetsManifest();
        if (!assetsManifest) throw new Error("No assets manifest");
        setAssetsManifest(assetsManifest);
      } catch (error) {
        setError(error instanceof Error ? error : new Error(String(error)));
      } finally {
        setLoading(false);
      }
    }

    loadAssetsManifest();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">My Assets</h1>
      {error && <p className="text-error">{error.message}</p>}
      {loading && <p>Loading...</p>}
      {assetsManifest && (
        <section className="grid grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-4 mt-4">
          {assetsManifest.installedAssets.map((result) => (
            <AssetCard key={result.cachedAsset.id} result={result.cachedAsset} />
          ))}
        </section>
      )}
    </div>
  );
}

export default About;
