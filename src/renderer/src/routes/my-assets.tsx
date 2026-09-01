import { AssetCard } from "@renderer/components/asset-card";
import useResult from "@renderer/hooks/use-result";
import { AssetsManifestType } from "@shared/types";
import { assetToAssetPreview } from "@shared/utils";
import { FileTextIcon, FolderIcon } from "lucide-react";
import { useCallback } from "react";

function About(): React.JSX.Element {
  const {
    loading,
    data: assetsManifest,
    error
  } = useResult<AssetsManifestType | null>(useCallback(() => window.api.readAssetsManifest(), []));

  return (
    <div className="p-4">
      <span className="w-full flex">
        <h1 className="text-2xl font-bold">My Assets</h1>
        <div className="grow" />
        <button className="btn btn-ghost btn-square mr-2" onClick={() => {}}>
          <FileTextIcon />
        </button>
        <button className="btn btn-ghost btn-square" onClick={() => {}}>
          <FolderIcon />
        </button>
      </span>
      {error && <p className="text-error">{error.message}</p>}
      {loading && <p>Loading...</p>}
      {assetsManifest && (
        <section className="grid grid-cols-[repeat(auto-fit,minmax(min(16rem,100%),1fr))] gap-4 mt-4">
          {assetsManifest.cachedAssets.map((result) => (
            <AssetCard key={result.id} result={assetToAssetPreview(result)} />
          ))}
        </section>
      )}
    </div>
  );
}

export default About;
