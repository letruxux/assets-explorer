import { Asset } from "@shared/types";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MetadataTable } from "./metadata";
import { isEntryEmpty } from "./metadata-utils";
import { Changelog } from "./changelog";
import { AssetDownloads } from "./downloads";
import Description from "./description";
import { ExternalLink } from "lucide-react";
import { Images } from "./images";

function ViewAsset(): React.JSX.Element {
  const { id } = useParams();
  const navigate = useNavigate();
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
        .filter(isEntryEmpty)
        .map(([k, v]) =>
          k === "RatingCount"
            ? ["Rating", `${original.RatingValue}|${original.RatingCount}`]
            : [k, v]
        )
    );
  }, [asset?.metadata]);

  const description = useMemo(() => asset?.metadata.description ?? "", [asset]);

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
      <h1 className="text-xl sm:text-2xl font-bold flex gap-x-2 items-center mb-1 min-w-0">
        <button className="btn btn-sm btn-square shrink-0" onClick={() => navigate(-1)}>
          &lt;
        </button>
        <span className="flex items-center gap-x-2 min-w-0">
          <a
            href={asset.page_url}
            rel="noreferrer"
            target="_blank"
            className="flex items-center gap-x-2 hover:underline min-w-0"
          >
            <span className="truncate">{asset.title}</span>{" "}
            <ExternalLink className="inline shrink-0" />
          </a>
          <small className="text-gray-500 text-xs">#{asset.id}</small>
        </span>
      </h1>

      <h3 className="mb-4">
        by <code>{asset.author}</code>
        <span className="text-gray-400 px-2">•</span>from <code>{asset._asset_source}</code>
      </h3>

      <Images asset={asset} />

      {description && <Description description={description} />}

      <MetadataTable description={description} metadata={metadata} />
      <AssetDownloads asset={asset} />
      <Changelog asset={asset} />

      <pre className="w-full p-1">{JSON.stringify(asset, null, 2)}</pre>
    </div>
  );
}

export default ViewAsset;
