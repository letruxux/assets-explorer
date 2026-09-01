import changeAssetsPath from "./change-assets-path";
import checkForDeletedFiles from "./check-for-deleted-files";
import deleteAsset from "./delete-asset";
import deleteStaleDbEntries from "./delete-stale-db-entries";
import downloadFile from "./download-file";
import getInstalledFiles from "./get-installed-files";
import openFileFolder from "./open-file-folder";
import testItchIo from "./test-itch-io";

export const actions = {
  openFileFolder,
  deleteAsset,
  downloadFile,
  getInstalledFiles,
  changeAssetsPath,
  testItchIo,
  checkForDeletedFiles,
  deleteStaleDbEntries
};
