import { Asset, AssetFile } from "@shared/types";
import { useCallback, useMemo } from "react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { AlertTriangle, Check, Download, Loader2, Lock, RefreshCw } from "lucide-react";
import useResult from "@renderer/hooks/use-result";
import { useInstalledFiles } from "@renderer/store/use-installed-files";

function SingleAssetDownload({ asset, dl }: { asset: Asset; dl: AssetFile }): React.JSX.Element {
  const { installedFiles } = useInstalledFiles();

  const downloaded = useMemo(
    () =>
      (installedFiles ?? []).some(
        (installedFile) => installedFile.assetId === asset.id && installedFile.file.name === dl.name
      ),
    [asset.id, installedFiles, dl.name]
  );
  const {
    error: downloadError,
    refetch: downloadFileCallback,
    loading: downloading
  } = useResult<void>(
    useCallback(async () => {
      await window.api.downloadFile(asset, dl);
    }, [asset, dl]),
    { autoFetchFirstTime: false }
  );

  const locked = dl.direct_url === "";

  return (
    <tr key={dl.name}>
      <td className="font-mono flex gap-x-1 items-center h-16">
        <span className="px-1 py-0.5 bg-base-200 truncate max-w-fit">{dl.name}</span>
        {dl.file_size && <span className="text-xs text-gray-400 shrink-0">({dl.file_size})</span>}
      </td>
      <td>
        {locked ? (
          <span className="text-gray-400">
            Locked - this file might require purchase to download.
          </span>
        ) : dl.date ? (
          new Date(dl.date).toLocaleDateString()
        ) : (
          "N/A"
        )}
      </td>
      <td>
        {downloadError && <span className="text-error">{downloadError.message}</span>}

        <button
          className="btn btn-primary"
          disabled={downloading || downloaded || locked}
          onClick={() => downloadFileCallback()}
        >
          {downloading ? (
            <>
              <Loader2 className="animate-spin" /> Downloading...
            </>
          ) : downloaded ? (
            <>
              <Check /> Downloaded
            </>
          ) : locked ? (
            <>
              <Lock /> Locked
            </>
          ) : (
            <>
              <Download /> Download
            </>
          )}
        </button>
      </td>
    </tr>
  );
}

export function AssetDownloads({ asset }: { asset: Asset }): React.JSX.Element {
  const {
    data: downloads,
    loading,
    error,
    refetch
  } = useResult<AssetFile[]>(
    useCallback(async () => await window.api.getDownloads(asset.id), [asset.id]),
    { clearDataOnRefetch: false }
  );

  const files = useMemo(() => {
    if (!downloads) return asset.files;

    const byName = new Map(downloads.map((dl) => [dl.name, dl]));
    return asset.files.map((file) => {
      const dl = byName.get(file.name);
      if (!dl) return file;
      return { ...file, ...dl };
    });
  }, [asset.files, downloads]);

  return (
    <>
      <h2 className="pt-4 pb-2 text-2xl font-bold">Files</h2>

      {loading ? (
        <div className="flex items-center gap-x-2 text-sm text-gray-400">
          <Loader2 className="animate-spin" /> Resolving download links...
        </div>
      ) : error ? (
        <div className="flex flex-col gap-y-2 items-start">
          <span className="text-sm text-error flex items-center gap-x-1">
            <AlertTriangle className="size-4" /> Failed to resolve download links
          </span>
          <button className="btn btn-ghost btn-sm" onClick={() => refetch()}>
            <RefreshCw /> Retry
          </button>
        </div>
      ) : files.length === 0 ? (
        <span className="text-sm text-gray-400">No downloadable files found</span>
      ) : (
        <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
          <table className="table">
            <tbody>
              {files.map((dl) => (
                <SingleAssetDownload key={dl.name} asset={asset} dl={dl} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
