import { Asset } from "@shared/types";
import { deepEquals } from "@shared/utils";
import { useCallback, useMemo } from "react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Check, Download, Loader2, Lock } from "lucide-react";
import useResult from "@renderer/hooks/use-result";
import { useInstalledFiles } from "@renderer/store/use-installed-files";

function SingleAssetDownload({
  asset,
  dl
}: {
  asset: Asset;
  dl: Asset["files"][number];
}): React.JSX.Element {
  const { installedFiles } = useInstalledFiles();

  const downloaded = useMemo(
    () =>
      asset
        ? (installedFiles ?? []).filter(
            (installedFile) =>
              installedFile.assetId === asset.id && deepEquals(installedFile.file, dl)
          ).length > 0
        : false,
    [asset, installedFiles, dl]
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
  if (asset.files.length === 0)
    return (
      <>
        <h2 className="pt-4 pb-2 text-2xl font-bold">Files</h2>

        <span className="text-sm text-gray-400">No downloadable files found</span>
      </>
    );

  return (
    <>
      <h2 className="pt-4 pb-2 text-2xl font-bold">Files</h2>

      <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
        <table className="table">
          <tbody>
            {asset.files.map((dl) => (
              <SingleAssetDownload key={dl.name} asset={asset} dl={dl} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
