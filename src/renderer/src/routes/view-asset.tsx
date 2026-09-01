import { Asset, parseId } from "@shared/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Check, Download, ExternalLink, Loader2, Lock } from "lucide-react";
import useResult from "@renderer/hooks/use-result";
import { useInstalledFiles } from "@renderer/store/use-installed-files";
import { cn } from "@renderer/lib/utils";

function MetadataValue({ name, value }: { name: string; value: unknown }): React.JSX.Element {
  switch (name.toLowerCase()) {
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

    case "rating": {
      const [rating, count] = (value as string).split("|").map(Number);
      return (
        <span className="flex items-center gap-x-2">
          <div className="rating rating-half">
            <div className="mask mask-star-2 mask-half-1 bg-orange-400" aria-checked={rating > 0} />
            <div
              className="mask mask-star-2 mask-half-2 bg-orange-400"
              aria-checked={rating > 0.5}
            />
            <div className="mask mask-star-2 mask-half-1 bg-orange-400" aria-checked={rating > 1} />
            <div
              className="mask mask-star-2 mask-half-2 bg-orange-400"
              aria-checked={rating > 1.5}
            />
            <div className="mask mask-star-2 mask-half-1 bg-orange-400" aria-checked={rating > 2} />
            <div
              className="mask mask-star-2 mask-half-2 bg-orange-400"
              aria-checked={rating > 2.5}
            />
            <div className="mask mask-star-2 mask-half-1 bg-orange-400" aria-checked={rating > 3} />
            <div
              className="mask mask-star-2 mask-half-2 bg-orange-400"
              aria-checked={rating > 3.5}
            />
            <div className="mask mask-star-2 mask-half-1 bg-orange-400" aria-checked={rating > 4} />
            <div
              className="mask mask-star-2 mask-half-2 bg-orange-400"
              aria-checked={rating > 4.5}
            />
          </div>
          <span className="text-xs text-gray-400">
            ({count}, {rating}/5)
          </span>
        </span>
      );
    }
    case "files":
      return <>{Number(value).toLocaleString()}</>;

    default:
      return <>{String(value)}</>;
  }
}

function MetadataRow({ name, value }: { name: string; value: unknown }): React.JSX.Element {
  return (
    <tr key={name}>
      <th>{name.toTitleCase()}</th>
      <td>
        <MetadataValue name={name} value={value} />
      </td>
    </tr>
  );
}

function ViewAsset(): React.JSX.Element {
  const { id } = useParams();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

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

  const metadata = useMemo(() => {
    const original = asset?.metadata ?? {};

    return Object.fromEntries(
      Object.entries(original)
        .filter(([k, v]) => v && !["Author", "RatingValue", "Status"].includes(k))
        .map(([k, v]) =>
          k === "RatingCount"
            ? ["Rating", `${original.RatingValue}|${original.RatingCount}`]
            : [k, v]
        )
    );
  }, [asset]);

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
            <span className="truncate">{asset.title}</span> <ExternalLink className="inline" />
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
            {Object.entries(metadata)
              .filter((e) => e[1])
              .map(([key, value]) => (
                <MetadataRow key={key} name={key} value={value} />
              ))}
          </tbody>
        </table>
      </div>

      <AssetDownloads asset={asset} />
      <Changelog asset={asset} />
    </div>
  );
}

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
              installedFile.assetId === asset.id && Object.equals(installedFile.file, dl)
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
        <span className="px-1 py-0.5 bg-base-200">{dl.name}</span>
        {dl.file_size && <span className="text-xs text-gray-400">({dl.file_size})</span>}
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

function AssetDownloads({ asset }: { asset: Asset }): React.JSX.Element {
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

function Changelog({ asset }: { asset: Asset }): React.JSX.Element {
  if (asset.changelog.length === 0)
    return (
      <>
        <h2 className="pt-4 pb-2 text-2xl font-bold">Changelog</h2>

        <span className="text-sm text-gray-400">No changelog found</span>
      </>
    );

  return (
    <>
      <h2 className="pt-4 pb-2 text-2xl font-bold">Changelog</h2>

      <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
        <table className="table">
          <tbody>
            {asset.changelog
              .sort((a, b) => b.date.localeCompare(a.date))
              .map(
                (c) =>
                  c.description && (
                    <tr key={c.name} className="group">
                      <td>
                        <span className="badge group-first:badge-primary">{c.name}</span>
                      </td>
                      <td>{c.description}</td>
                    </tr>
                  )
              )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default ViewAsset;
