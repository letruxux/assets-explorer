import { cloneElement } from "react";
import {
  CuboidIcon,
  DiamondIcon,
  DownloadIcon,
  EyeIcon,
  FolderIcon,
  HeartIcon,
  InfoIcon,
  PaintbrushIcon,
  ScaleIcon,
  TriangleIcon,
  VolumeIcon
} from "lucide-react";
import { transformKey } from "./metadata-utils";
import { AssetMetadata } from "@shared/types";
import { cn } from "@renderer/lib/utils";
import toast from "react-hot-toast";

function MetadataValue({ name, value }: { name: string; value: unknown }): React.JSX.Element {
  const icon = {
    pbrtype: <CuboidIcon />,
    vertexcount: <TriangleIcon />,
    facecount: <CuboidIcon />,
    viewcount: <EyeIcon />,
    downloadcount: <DownloadIcon />,
    likecount: <HeartIcon />,
    soundcount: <VolumeIcon />,
    animationcount: <CuboidIcon />,
    materialcount: <DiamondIcon />,
    texturecount: <PaintbrushIcon />,
    tile_size: <PaintbrushIcon />,
    license: <ScaleIcon />,
    attribution: <ScaleIcon />,
    files: <FolderIcon />,
    content: <InfoIcon />,
    "code license": <ScaleIcon />
  }[name.toLowerCase()];

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

    case "categories":
      return (
        <div className="flex gap-x-1 overflow-x-auto">
          {(value as string[]).map((tag) => (
            <span key={tag} className="badge badge-accent truncate">
              {tag.toTitleCase()}
            </span>
          ))}
        </div>
      );

    case "features":
      return (
        <div className="flex gap-x-1 overflow-x-auto">
          {(value as string[]).map((tag) => (
            <span key={tag} className="badge badge-accent truncate">
              {tag
                .toTitleCase()
                .replace(
                  /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
                  ""
                )}
            </span>
          ))}
        </div>
      );

    case "series":
    case "category":
      return (
        <div className="flex gap-x-1 overflow-x-auto">
          <span className="badge badge-accent truncate">{(value as string).toTitleCase()}</span>
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

    case "pbrtype":
      return (
        <span className="flex gap-x-1 items-center">
          {icon && cloneElement(icon, { className: "size-4" })}
          {String(value).toTitleCase()}
        </span>
      );

    case "files":
    case "viewcount":
    case "downloadcount":
    case "likecount":
    case "soundcount":
    case "animationcount":
    case "facecount":
    case "vertexcount":
    case "materialcount":
    case "texturecount":
      return (
        <span className="flex gap-x-1 items-center">
          {icon && cloneElement(icon, { className: "size-4" })}
          {Number(value).toLocaleString()}
        </span>
      );

    case "attribution":
      return (
        <span className="flex gap-x-1 items-center">
          {icon && cloneElement(icon, { className: "size-4" })}
          <code
            className="px-1 bg-base-200 cursor-pointer hover:bg-base-300 transition-colors truncate"
            onClick={() => {
              try {
                navigator.clipboard.writeText(String(value));
                toast.success("Copied to clipboard");
              } catch {
                toast.error("Failed to copy to clipboard");
              }
            }}
          >
            {String(value)}
          </code>
        </span>
      );

    default:
      return (
        <span className="flex gap-x-1 items-center">
          {icon && cloneElement(icon, { className: "size-4" })}
          {String(value)}
        </span>
      );
  }
}

function MetadataRow({ name, value }: { name: string; value: unknown }): React.JSX.Element {
  return (
    <tr key={name}>
      <th>{transformKey(name)}</th>
      <td>
        <MetadataValue name={name} value={value} />
      </td>
    </tr>
  );
}

export function MetadataTable({
  description,
  metadata
}: {
  description: string;
  metadata: AssetMetadata;
}): React.JSX.Element {
  return (
    <div
      className={cn("overflow-x-auto rounded-box border border-base-content/5 bg-base-100 w-full", {
        "mt-4": !description
      })}
    >
      <table className="table">
        <tbody>
          {Object.entries(metadata)
            .filter((e) => e[1] && e[0] !== "description")
            .map(([key, value]) => (
              <MetadataRow key={key} name={key} value={value} />
            ))}
        </tbody>
      </table>
    </div>
  );
}
