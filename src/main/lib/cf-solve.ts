import { BrowserWindow, session } from "electron";

export async function fetchWithElectronBrowser(url: string): Promise<string> {
  const ses = session.fromPartition("persist:cf-solve");

  const win = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      session: ses,
      sandbox: true,
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  try {
    await win.loadURL(url);

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Took too long."));
      }, 60000);

      const checkChallenge = async (): Promise<void> => {
        if (win.isDestroyed()) {
          clearTimeout(timeout);
          return reject(new Error("Window was closed!"));
        }

        const title = win.getTitle();
        const isBlocked =
          title.includes("Just a moment...") || title.includes("Attention Required!");

        if (isBlocked) {
          if (!win.isVisible()) {
            win.show();
            win.focus();
          }
          setTimeout(checkChallenge, 500);
        } else {
          clearTimeout(timeout);
          resolve();
        }
      };

      checkChallenge();
    });

    const html = await win.webContents.executeJavaScript("document.documentElement.outerHTML");

    return html;
  } finally {
    if (!win.isDestroyed()) {
      win.close();
    }
  }
}
