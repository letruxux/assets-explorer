import { Asset } from "@shared/types";

export function Changelog({ asset }: { asset: Asset }): React.JSX.Element {
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
              .map((c) => (
                <tr key={c.name} className="group">
                  <td>
                    <span className="badge group-first:badge-primary">{c.name}</span>
                  </td>
                  <td>{c.description}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
