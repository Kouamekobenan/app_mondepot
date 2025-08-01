import { app, BrowserWindow, ipcMain, Notification, shell } from "electron";
import path from "path";
import { is } from "@electron-toolkit/utils";
import Store from "electron-store";

// Initialise le store
const store = new Store<{ token?: string }>() as any;
function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    title: "DrinkFlow",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  if (is.dev) {
    win.loadURL("http://localhost:3000");
    // win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "../../renderer/out/index.html"));
  }

  win.once("ready-to-show", () => {
    win.show();
  });
}

app.whenReady().then(() => {
  createWindow();

  // ✅ Récupérer le token
  ipcMain.handle("get-token", () => store.get("token"));

  // ✅ Met à jour ou supprime le token proprement
  ipcMain.handle("set-token", (_, token: string | null | undefined) => {
    if (token === null || token === undefined) {
      store.delete("token");
    } else {
      store.set("token", token);
    }
  });

  // ✅ Suppression explicite
  ipcMain.handle("delete-token", () => {
    store.delete("token");
  });

  // ✅ Notification de succès
  ipcMain.on("login-success", (_, data) => {
    new Notification({
      title: data.title,
      body: data.body,
    }).show();
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
