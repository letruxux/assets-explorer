import { is } from "@electron-toolkit/utils";
import { NotConfiguredError } from "@shared/errors";
import { SettingsType } from "@shared/types";
import { app, BrowserWindow } from "electron";
import electronSettings from "electron-settings";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";

function getDefaultAssetsPath(): string | null {
  const choices = [
    join(app.getPath("documents"), "Assets"),
    join(app.getPath("documents"), "Development Assets"),
    join(app.getPath("documents"), "Dev Assets")
  ];
  for (const folder of choices) {
    if (existsSync(folder)) {
      if (existsSync(join(folder, ".assets.json"))) {
        return folder;
      }
    } else {
      mkdirSync(folder, { recursive: true });
      return folder;
    }
  }

  return null;
}

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
    return {
      ...DEFAULT_SETTINGS,
      ...electronSettings.getSync()
    } as unknown as SettingsType;
  }
}

export const settings = new SettingsManager();

export const DEFAULT_SETTINGS: SettingsType = {
  assetsPath: getDefaultAssetsPath(),
  sketchfabApiKey: null,
  polyPizzaApiKey: null,
  showFeatured: true,
  showDebugInfo: false
};
