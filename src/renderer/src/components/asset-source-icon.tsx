import { AssetSource } from "@shared/types";

export function AssetSourceIcon({ source }: { source: AssetSource }): React.JSX.Element {
  switch (source) {
    case "kenney.nl":
      return <img src="https://kenney.nl/favicon.ico" alt="kenney.nl" className="size-[1em]" />;
    case "itch.io":
      return <img src="https://itch.io/favicon.ico" alt="itch.io" className="size-[1em]" />;
    case "sketchfab":
      return <img src="https://sketchfab.com/favicon.ico" alt="sketchfab" className="size-[1em]" />;
    case "poly.pizza":
      return <img src="https://poly.pizza/favicon.ico" alt="poly.pizza" className="size-[1em]" />;
  }
}

export function AssetSourceBadge({ source }: { source: AssetSource }): React.JSX.Element {
  const abc = (
    <>
      <AssetSourceIcon source={source} />
      {source}
    </>
  );

  switch (source) {
    case "kenney.nl":
      return <span className="badge badge-outline badge-kenney">{abc}</span>;
    case "itch.io":
      return <span className="badge badge-outline badge-error">{abc}</span>;
    case "sketchfab":
      return <span className="badge badge-outline badge-sketchfab">{abc}</span>;
    case "poly.pizza":
      return <span className="badge badge-outline badge-orange">{abc}</span>;
  }
  /*
  --badge-color: var(--color-error);
  --badge-fg: var(--color-error-content)
  */
}
