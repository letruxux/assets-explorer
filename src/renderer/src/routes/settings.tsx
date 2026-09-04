import useResult from "@renderer/hooks/use-result";
import { useSettings } from "@renderer/store/use-settings";
import { DEFAULT_SETTINGS, SettingsType } from "@shared/types";
import { Loader2, SaveIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

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

function BasicSetting({
  name,
  value,
  setValue,
  label,
  actualAppliedSettings
}: {
  name: keyof SettingsType;
  value: SettingsType[keyof SettingsType];
  setValue: (value: SettingsType[keyof SettingsType]) => void;
  label?: string;
  actualAppliedSettings: SettingsType | null;
}): React.JSX.Element {
  const initialValue = useMemo(() => actualAppliedSettings?.[name], [actualAppliedSettings, name]);

  const setSettingResult = useResult<void>(
    useCallback(() => window.api.setSetting(name, value), [name, value]),
    { autoFetchFirstTime: false }
  );

  return (
    <tr>
      <th>{label || name}</th>
      <td className="flex flex-col items-end gap-y-2">
        <div className="flex items-center justify-end gap-x-2 w-full">
          <input
            type="text"
            className="input flex-1 min-w-0"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            value={value as any}
            onChange={(e) => setValue(e.target.value)}
            placeholder="-"
          />
          <button
            className="btn btn-square"
            disabled={value === initialValue || setSettingResult.loading}
            onClick={() => setSettingResult.refetch()}
          >
            {setSettingResult.loading ? <Loader2 className="animate-spin" /> : <SaveIcon />}
          </button>
        </div>
        {setSettingResult.error && (
          <span className="text-error text-left">{setSettingResult.error.message}</span>
        )}
      </td>
    </tr>
  );
}

function SettingGroup({
  children,
  label
}: {
  children: React.ReactNode;
  label?: string;
}): React.JSX.Element {
  return (
    <div>
      {label && <h2 className="font-bold text-xl mb-2">{label}</h2>}
      <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100 w-full">
        <table className="table">
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}

function Settings(): React.JSX.Element {
  const { settings, loading } = useSettings();
  const [sketchfabApiKey, setSketchfabApiKey] = useState(settings?.sketchfabApiKey ?? "");
  const [polyPizzaApiKey, setPolyPizzaApiKey] = useState(settings?.polyPizzaApiKey ?? "");
  const [showFeatured, setShowFeatured] = useState(
    settings?.showFeatured ?? DEFAULT_SETTINGS.showFeatured
  );
  const [showDebugInfo, setShowDebugInfo] = useState(
    settings?.showDebugInfo ?? DEFAULT_SETTINGS.showDebugInfo
  );
  const [savingFeatured, setSavingFeatured] = useState(false);
  const [savingDebugInfo, setSavingDebugInfo] = useState(false);

  useEffect(() => {
    if (settings) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPolyPizzaApiKey(settings.polyPizzaApiKey ?? "");
      setSketchfabApiKey(settings.sketchfabApiKey ?? "");
      setShowFeatured(settings.showFeatured);
      setShowDebugInfo(settings.showDebugInfo);
    }
  }, [settings]);

  return (
    <>
      <CheckDeletedFilesModal />
      <div className="p-4">
        {loading || !settings ? (
          <p className="mt-2 text-base-content/70">Loading...</p>
        ) : (
          <div className="flex flex-col gap-y-4">
            <SettingGroup label="General">
              <tr>
                <th>Assets path</th>
                <td className="flex items-center justify-end gap-x-2">
                  <input
                    type="text"
                    disabled
                    className="input flex-1 min-w-0"
                    value={settings.assetsPath ?? "-"}
                  />
                  <button className="btn" onClick={() => window.api.changeAssetsPath()}>
                    Change
                  </button>
                </td>
              </tr>
            </SettingGroup>
            <SettingGroup label="Websites">
              <BasicSetting
                label="Sketchfab API key"
                name="sketchfabApiKey"
                value={sketchfabApiKey}
                /// @ts-ignore meow mwow
                setValue={setSketchfabApiKey}
                actualAppliedSettings={settings}
              />
              <BasicSetting
                label="poly.pizza API key"
                name="polyPizzaApiKey"
                value={polyPizzaApiKey}
                /// @ts-ignore meow mwow
                setValue={setPolyPizzaApiKey}
                actualAppliedSettings={settings}
              />
            </SettingGroup>
            <SettingGroup label="Appearance">
              <tr>
                <th>Show featured assets</th>
                <td className="flex items-center justify-end gap-x-2">
                  <label className="toggle text-base-content">
                    <input
                      type="checkbox"
                      checked={showFeatured}
                      onChange={() => {
                        const newValue = !showFeatured;
                        setShowFeatured(newValue);
                        setSavingFeatured(true);
                        window.api
                          .setSetting("showFeatured", newValue)
                          .finally(() => setSavingFeatured(false));
                      }}
                      disabled={savingFeatured}
                    />

                    <svg
                      aria-label="disabled"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>

                    <svg
                      aria-label="enabled"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <g
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        strokeWidth="4"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </g>
                    </svg>
                  </label>
                </td>
              </tr>
            </SettingGroup>
            <SettingGroup label="Debug">
              <ItchIoTestSetting />
              <CheckDeletedFilesSetting />
              <tr>
                <th>Show debug info</th>
                <td className="flex items-center justify-end gap-x-2">
                  <label className="toggle text-base-content">
                    <input
                      type="checkbox"
                      checked={showDebugInfo}
                      onChange={() => {
                        const newValue = !showDebugInfo;
                        setShowDebugInfo(newValue);
                        setSavingDebugInfo(true);
                        window.api
                          .setSetting("showDebugInfo", newValue)
                          .finally(() => setSavingDebugInfo(false));
                      }}
                      disabled={savingDebugInfo}
                    />

                    <svg
                      aria-label="disabled"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>

                    <svg
                      aria-label="enabled"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <g
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        strokeWidth="4"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </g>
                    </svg>
                  </label>
                </td>
              </tr>
            </SettingGroup>
          </div>
        )}
        {settings.showDebugInfo && (
          <pre className="bg-base-200 p-1">{JSON.stringify(settings, null, 2)}</pre>
        )}
      </div>
    </>
  );
}

export default Settings;
