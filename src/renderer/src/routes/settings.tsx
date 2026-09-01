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

function CheckDeletedFilesModal(): React.JSX.Element {
  const check1 = useResult(
    useCallback(() => window.api.checkForDeletedFiles(), []),
    { autoFetchFirstTime: false }
  );
  const check2 = useResult(
    useCallback(
      () => window.api.deleteStaleDatabaseEntries(check1.data?.deletedFiles ?? []),
      [check1.data?.deletedFiles]
    ),
    { autoFetchFirstTime: false }
  );

  return (
    <dialog id="deleted-files-modal" className="modal">
      <div className="modal-box flex flex-col gap-y-4">
        <h3 className="font-bold text-lg">Check deleted files</h3>
        <button
          disabled={check1.loading}
          className="btn btn-primary"
          onClick={() => {
            check1.refetch();
            check2.reset();
          }}
        >
          Run check
        </button>
        {check1.error && <span className="text-error">{check1.error.message}</span>}
        {check1.data && (
          <span className="text-base-content/70 text-center">
            {check1.data.found > 0
              ? `Found ${check1.data.found} deleted files`
              : "No deleted files found"}
          </span>
        )}
        {(check1.data?.found ?? 0) > 0 && (
          <>
            <button
              disabled={check2.loading}
              className="btn btn-error btn-ghost"
              onClick={() => check2.refetch()}
            >
              Delete stale database entries
            </button>
            {check2.error && <span className="text-error">{check2.error.message}</span>}
            {check2.data && (
              <>
                {check2.data > 0 && (
                  <span className="text-base-content/70 text-center">
                    {check2.data > 0
                      ? `Deleted ${check2.data} entries successfully`
                      : "No entries deleted"}
                  </span>
                )}
              </>
            )}
          </>
        )}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}

function CheckDeletedFilesSetting(): React.JSX.Element {
  return (
    <tr>
      <th>Check for deleted files</th>
      <td className="flex items-center justify-end gap-x-2">
        <button
          className="btn"
          onClick={() =>
            (document.getElementById("deleted-files-modal") as HTMLDialogElement).showModal()
          }
        >
          Open check menu
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
    <>
      <CheckDeletedFilesModal />
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
                <CheckDeletedFilesSetting />
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default Settings;
