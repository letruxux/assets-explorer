import { AssetCard } from "@renderer/components/asset-card";
import useResult from "@renderer/hooks/use-result";
import { AssetsManifestType } from "@shared/types";
import { assetToAssetPreview } from "@shared/utils";
import { useCallback } from "react";

function About(): React.JSX.Element {
  const {
    loading,
    data: assetsManifest,
    error
  } = useResult<AssetsManifestType | null>(useCallback(() => window.api.readAssetsManifest(), []));

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">My Assets</h1>
      {error && <p className="text-error">{error.message}</p>}
      {loading && <p>Loading...</p>}
      {assetsManifest && (
        <section className="grid grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-4 mt-4">
          {assetsManifest.cachedAssets.map((result) => (
            <AssetCard key={result.id} result={assetToAssetPreview(result)} />
          ))}
        </section>
      )}
    </div>
  );
}

export default About;
