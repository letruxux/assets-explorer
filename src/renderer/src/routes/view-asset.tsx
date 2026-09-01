import { Asset, parseId } from "@shared/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { ExternalLink } from "lucide-react";
import { useInstalledAssetIds } from "@renderer/hooks/use-installed-asset-ids";

function MetadataValue({ name, value }: { name: string; value: unknown }): React.JSX.Element {
  switch (name) {
    case "tags":
      return (
        <div className="flex gap-x-1 overflow-x-auto">
          {(value as string[]).map((tag) => (
            <span key={tag} className="badge badge-primary truncate">
              {tag.toTitleCase()}
            </span>
          ))}
        </div>
      );

    case "files":
      return <>{Number(value).toLocaleString()}</>;

    default:
      return <>{String(value)}</>;
  }
}

function ViewAsset(): React.JSX.Element {
  const { id } = useParams();
  const { installedAssetIds, refetch } = useInstalledAssetIds();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<Error | null>(null);

  const downloaded = useMemo(
    () => (asset ? installedAssetIds.includes(asset?.id) : false),
    [installedAssetIds, asset]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadAsset(): Promise<void> {
      if (!id) return;
      setLoading(true);
      setError(null);
      setAsset(null);

      try {
        const result = await window.api.fetchAssetDetail(id);

        if (!cancelled) {
          setAsset(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAsset();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const downloadFileCallback = useCallback(
    async (file: Asset["files"][number]) => {
      if (!asset) return;
      setDownloading(true);
      setDownloadError(null);
      try {
        await window.api.downloadFile(file.direct_url, file.name, asset.id);
      } catch (err) {
        setDownloadError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setDownloading(false);
      }
      await refetch();
    },
    [asset, refetch]
  );

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    throw error;
  }

  if (!asset) {
    return <div className="p-4">Asset not found</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold flex gap-x-2 items-center mb-1">
        <button className="btn btn-sm btn-square" onClick={() => navigation.back()}>
          &lt;
        </button>
        <span className="flex items-center gap-x-2">
          <a
            href={parseId(asset.id).pageUrl}
            rel="noreferrer"
            target="_blank"
            className="flex items-center gap-x-2 hover:underline"
          >
            {asset.title} <ExternalLink className="inline" />
          </a>
          <small className="text-gray-500 text-xs">#{asset.id}</small>
        </span>
      </h1>
      <h3 className="mb-4">
        by <code>{asset.author}</code>
        <span className="text-gray-400 px-2">•</span>from <code>{asset._asset_source}</code>
      </h3>

      <Swiper
        modules={[Navigation, Pagination, A11y]}
        navigation
        pagination={{ clickable: true }}
        spaceBetween={16}
        slidesPerView={1}
        className="w-full max-w-2xl aspect-video"
      >
        {asset.images.map((image, index) => (
          <SwiperSlide key={`${image}-${index}`} className="flex items-center justify-center">
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-lg bg-black">
              <img
                src={image}
                alt={`${asset.title} preview ${index + 1}`}
                className="h-full w-full object-contain"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100 mt-4 w-full">
        <table className="table">
          <tbody>
            {Object.entries(asset.metadata)
              .filter((e) => e[1])
              .map(([key, value]) => (
                <tr key={key}>
                  <th>{key.toTitleCase()}</th>
                  <td>
                    <MetadataValue key={key} name={key} value={value} />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {asset.files.length > 0 && (
        <>
          <h2 className="pt-4 pb-2 text-2xl font-bold">Files</h2>

          <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
            <table className="table">
              <tbody>
                {asset.files.map((dl) => (
                  <tr key={dl.name}>
                    <td className="font-mono flex gap-x-1 items-center h-16">
                      <span className="px-1 py-0.5 bg-base-200">{dl.name}</span>
                      {dl.file_size && (
                        <span className="text-xs text-gray-400">({dl.file_size})</span>
                      )}
                    </td>
                    <td>{dl.date ? new Date(dl.date).toLocaleDateString() : "N/A"}</td>
                    <td>
                      {downloadError && <span className="text-error">{downloadError.message}</span>}
                      <button
                        className="btn btn-primary"
                        disabled={downloading || downloaded}
                        onClick={() => downloadFileCallback(dl)}
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default ViewAsset;
