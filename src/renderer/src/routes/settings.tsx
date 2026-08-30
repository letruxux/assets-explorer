import { SettingsType } from "@shared/types";
import { useCallback, useEffect, useState } from "react";

function Settings(): React.JSX.Element {
  const [settings, setSettings] = useState<SettingsType>({} as SettingsType);
  const [loading, setLoading] = useState(false);

  const loadSettings = useCallback(async function (): Promise<void> {
    setLoading(true);
    try {
      const result = await window.api.readSettings();
      setSettings(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      {loading ? (
        <p className="mt-2 text-base-content/70">Loading...</p>
      ) : (
        <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100 mt-4 w-full">
          <table className="table">
            <tbody>
              <tr>
                <th>Assets path</th>
                <td className="flex items-center justify-end gap-x-2">
                  <input
                    type="text"
                    disabled
                    className="input"
                    value={settings.assetsPath ?? "-"}
                  />
                  <button
                    className="btn"
                    onClick={() => window.api.changeAssetsPath().then(loadSettings)}
                  >
                    Change
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Settings;
