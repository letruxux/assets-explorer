import useResult from "@renderer/hooks/use-result";
import { SettingsType } from "@shared/types";
import { useCallback } from "react";

function ItchIoTestSetting(): React.JSX.Element {
  const {
    loading,
    data: result,
    error,
    refetch: run
  } = useResult<string>(
    useCallback(() => window.api.testItchIo(), []),
    { autoFetchFirstTime: false }
  );

  return (
    <tr>
      <th>Test itch.io</th>
      <td className="flex items-center justify-end gap-x-2">
        {error && <span className="text-error">{error.message}</span>}
        {loading && <span className="text-base-content/70">Loading...</span>}
        {result && <span className="text-base-content/70">{result}</span>}
        <button className="btn" onClick={() => run()}>
          Run test
        </button>
      </td>
    </tr>
  );
}

function Settings(): React.JSX.Element {
  const {
    loading,
    data: settings,
    refetch
  } = useResult<SettingsType>(useCallback(() => window.api.readSettings(), []));

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      {loading || !settings ? (
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
                    className="input flex-1 min-w-0"
                    value={settings.assetsPath ?? "-"}
                  />
                  <button
                    className="btn"
                    onClick={() => window.api.changeAssetsPath().then(refetch)}
                  >
                    Change
                  </button>
                </td>
              </tr>
              <ItchIoTestSetting />
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Settings;
