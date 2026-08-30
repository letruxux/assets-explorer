import { SettingsType } from "@shared/types";
import electronSettings from "electron-settings";

class SettingsManager {
  public get(): SettingsType;
  public get(key: keyof SettingsType): SettingsType[keyof SettingsType];
  public get(key?: keyof SettingsType): SettingsType[keyof SettingsType] | SettingsType {
    if (key) {
      return electronSettings.getSync(
        key as unknown as keyof SettingsType
      ) as SettingsType[keyof SettingsType];
    }
    return electronSettings.getSync() as unknown as SettingsType;
  }

  public set(key: keyof SettingsType, value: SettingsType[keyof SettingsType]): void {
    electronSettings.setSync(key, value);
  }
}

export const settings = new SettingsManager();
