import { cn } from "@renderer/lib/utils";
import { AssetPreview } from "@shared/types";
import { useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Folder } from "lucide-react";
import { useInstalledFiles } from "@renderer/store/use-installed-files";

export function AssetCard({
  result,
  query
}: {
  result: AssetPreview;
  query?: string;
}): React.JSX.Element {
  const { installedFiles } = useInstalledFiles();

  const allInstalledFilesOfAsset = useMemo(
    () => (installedFiles ?? []).filter((file) => file.assetId === result.id),
    [installedFiles, result]
  );

  const hasAnyFileInstalled = useMemo(
    () => allInstalledFilesOfAsset.length > 0,
    [allInstalledFilesOfAsset]
  );

  const openAssetFolderCallback = useCallback(async () => {
    await window.api.openFileFolder(allInstalledFilesOfAsset[0]);
  }, [allInstalledFilesOfAsset]);

  const tagsInQuery = useMemo(
    () =>
      (query ?? "")
        .toLowerCase()
        .split(" ")
        .filter((e) => e.length > 0),
    [query]
  );

  const sortedTags = useMemo(() => result.tags.sort(), [result.tags]);

  return (
    <Link to={`/asset/${result.id}`}>
      <article
        className={cn("card w-full bg-base-100 shadow-sm card-border", {
          "border-green-400": hasAnyFileInstalled
        })}
      >
        <figure
          className={cn("overflow-hidden relative", {
            "aspect-video": result._asset_source === "kenney.nl",
            "aspect-4/3": result._asset_source === "itch.io"
          })}
        >
          {result.price && (
            <span
              className={cn("badge absolute top-2 left-2", {
                "badge-error": result.price !== undefined
              })}
            >
              {result.price}
            </span>
          )}
          <img src={result.images[0]} alt={result.title} className="h-full w-full object-cover" />
        </figure>
        <div className="card-body">
          <div className="mb-1">
            <h2 className="card-title">{result.title}</h2>
            <h4 className="text-gray-400">{result.author}</h4>
          </div>

          {sortedTags.length > 0 && (
            <div className="flex gap-x-2 w-full overflow-auto scrollbar-none">
              <span className={cn("badge badge-accent")}>{result._asset_source}</span>
              {sortedTags.map((e) => (
                <span
                  className={cn("badge whitespace-nowrap", {
                    "badge-primary": tagsInQuery.includes(e.toLowerCase()),
                    "badge-dash": !tagsInQuery.includes(e.toLowerCase())
                  })}
                  key={e}
                >
                  {e.toTitleCase()}
                </span>
              ))}
            </div>
          )}

          {hasAnyFileInstalled && (
            <div className="card-actions mt-2 flex justify-end items-center">
              <span className="text-gray-400">
                {allInstalledFilesOfAsset.length > 1 && allInstalledFilesOfAsset.length}
              </span>
              <button
                className="btn btn-square"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openAssetFolderCallback();
                }}
              >
                <Folder />
              </button>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
