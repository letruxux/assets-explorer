import { useInstalledAssetIds } from "@renderer/hooks/use-installed-asset-ids";
import { cn } from "@renderer/lib/utils";
import { useInstalledAssetsStore } from "@renderer/store/installed-assets";
import { AssetPreview } from "@shared/types";
import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import Spinner from "./spinner";
import { Folder, Trash2 } from "lucide-react";

export function AssetCard({
  result,
  query
}: {
  result: AssetPreview;
  query?: string;
}): React.JSX.Element {
  const { installedAssetIds } = useInstalledAssetIds();
  const { removeInstalledAssetId } = useInstalledAssetsStore();

  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<Error | null>(null);

  const openAssetFolderCallback = useCallback(async () => {
    setDeleting(true);
    setDeleteError(null);

    try {
      await window.api.openAssetFolder(result.id);
    } catch (error) {
      setDeleteError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setDeleting(false);
    }
  }, [result]);

  const deleteCallback = useCallback(async () => {
    setDeleting(true);
    setDeleteError(null);

    try {
      await window.api.deleteAsset(result.id);
      removeInstalledAssetId(result.id);
    } catch (error) {
      setDeleteError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setDeleting(false);
    }
  }, [result, removeInstalledAssetId]);

  const tagsInQuery = useMemo(
    () =>
      (query ?? "")
        .toLowerCase()
        .split(" ")
        .filter((e) => e.length > 0),
    [query]
  );

  const isDownloaded = useMemo(
    () => installedAssetIds.includes(result.id),
    [installedAssetIds, result.id]
  );

  return (
    <Link to={`/asset/${result.id}`}>
      <article
        className={cn("card w-full bg-base-100 shadow-sm card-border", {
          "border-green-400": isDownloaded
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
            {result._asset_source === "itch.io" && (
              <h4 className="text-gray-400">{result.author}</h4>
            )}
          </div>

          {result.tags.length > 0 && (
            <div className="flex gap-x-2 w-full overflow-auto scrollbar-none">
              {result.tags.map((e) => (
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
          )}
          {!!(deleteError || isDownloaded) && (
            <div className="card-actions mt-2 flex justify-end">
              {deleteError && <span className="text-error">{deleteError.message}</span>}

              {isDownloaded && (
                <button
                  className="btn btn-square btn-error btn-ghost"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    deleteCallback();
                  }}
                >
                  {deleting ? <Spinner /> : <Trash2 />}
                </button>
              )}
              {isDownloaded && (
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
              )}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
