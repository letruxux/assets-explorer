import { Asset } from "@shared/types";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

function ViewAsset(): React.JSX.Element {
  const { source, slug } = useParams();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!source || !slug) return;

    let cancelled = false;

    async function loadAsset() {
      if (!source || !slug) return;
      setLoading(true);
      setError(null);
      setAsset(null);

      try {
        const result = await window.api.fetchAssetDetail(source, slug);

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
  }, [source, slug]);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error.message}</div>;
  }

  if (!asset) {
    return <div className="p-4">Asset not found</div>;
  }

  if (!asset.images?.length) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold">{asset.title}</h1>
        <p className="mt-4">No images available.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold flex gap-x-2 items-center mb-1">
        <button className="btn btn-sm btn-square" onClick={() => navigation.back()}>
          &lt;
        </button>
        <span>{asset.title}</span>
      </h1>
      <h3 className="mb-4">by {Object.hasOwn(asset, "author") ? (asset as any).author : asset._asset_source} • from {asset._asset_source}</h3>

      <Swiper
        modules={[Navigation, Pagination, A11y]}
        navigation
        pagination={{ clickable: true }}
        spaceBetween={16}
        slidesPerView={1}
        className="w-full max-w-2xl aspect-video"
      >
        {asset.images.map((image, index) => (
          <SwiperSlide key={`${image}-${index}`}>
            <div className="flex items-center justify-center overflow-hidden rounded-lg bg-black">
              <img
                src={image}
                alt={`${asset.title} preview ${index + 1}`}
                className="h-full w-full object-contain"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100 mt-4">
        <table className="table">
          <tbody>
            {/* row 1 */}
            {Object.entries(asset.meta)
              .filter((e) => e[1])
              .map(([key, value]) => (
                <tr key={key}>
                  <th>{key}</th>
                  <td>
                    {(() => {
                      switch (key) {
                        case "Tags":
                          return (
                            <div className="gap-x-1 flex">
                              {(value as string[]).map((e) => (
                                <span key={e} className="badge badge-primary">
                                  {e.toTitleCase()}
                                </span>
                              ))}
                            </div>
                          );

                        case "Files":
                          return <span>{value.toLocaleString()}</span>;

                        default:
                          return <span>{value}</span>;
                      }
                    })()}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ViewAsset;
