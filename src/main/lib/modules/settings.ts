import { is } from "@electron-toolkit/utils";
import { NotConfiguredError } from "@shared/errors";
import { DEFAULT_SETTINGS, SettingsType } from "@shared/types";
import { BrowserWindow } from "electron";
import electronSettings from "electron-settings";

electronSettings.configure({
  fileName: is.dev ? "settings.dev.json" : "settings.json"
});

class SettingsManager {
  public get<K extends keyof SettingsType>(key: K): SettingsType[K] {
    return (electronSettings.getSync(key) ?? DEFAULT_SETTINGS[key]) as SettingsType[K];
  }

  public getOrError<K extends keyof SettingsType>(key: K): NonNullable<SettingsType[K]> {
    const value = this.get(key);

    if (value === undefined || value === null || value === "") {
      throw new NotConfiguredError(`Setting not set: ${key}`);
    }

    return value as NonNullable<SettingsType[K]>;
  }

  public set(key: keyof SettingsType, value: SettingsType[keyof SettingsType]): void {
    electronSettings.setSync(key, value);
    BrowserWindow.getAllWindows().forEach((w) => w.webContents.send("settings-updated"));
  }

  public getAll(): SettingsType {
    return { ...DEFAULT_SETTINGS, ...electronSettings.getSync() } as unknown as SettingsType;
  }
}

export const settings = new SettingsManager();
