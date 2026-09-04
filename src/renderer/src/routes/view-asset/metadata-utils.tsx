import { ReactNode } from "react";

export function transformKey(key: string): ReactNode {
  switch (key.toLowerCase()) {
    case "facecount":
      return <>Faces</>;
    case "vertexcount":
      return <>Vertices</>;
    case "viewcount":
      return <>Views</>;
    case "downloadcount":
      return <>Downloads</>;
    case "likecount":
      return <>Likes</>;
    case "soundcount":
      return <>Sounds</>;
    case "animationcount":
      return <>Animations</>;
    case "pbrtype":
      return <>PBR Type</>;
    case "materialcount":
      return <>Materials</>;
    case "texturecount":
      return <>Textures</>;
    case "category":
      return <>Category</>;
    case "tile_size":
      return <>Tile Size</>;

    default:
      return key.toTitleCase();
  }
}

export function isEntryEmpty([k, v]: [string, unknown]): boolean {
  return (
    v !== null &&
    v !== undefined &&
    (typeof v === "string" ? v.length > 0 : true) &&
    (Array.isArray(v) ? v.length > 0 : true) &&
    !["author", "ratingvalue", "status"].includes(k.toLowerCase())
  );
}
