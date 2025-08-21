import {
  app,
  BrowserWindow,
  ipcMain,
  Notification,
  shell,
  Tray,
  Menu,
} from "electron";
import path from "path";
import { is } from "@electron-toolkit/utils";
import Store from "electron-store";

const store = new Store<{ token?: string }>() as any;

let tray: Tray | null = null;
let win: BrowserWindow | null = null;
let isQuitting = false; //remplace app.isQuiting

// Chemin d’icône (même image pour la fenêtre et le tray)
const ICON_PATH = path.join(__dirname, "../electron/assets/icon-png.png");

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    title: "12Dépôt",
    icon: ICON_PATH,
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

  win.once("ready-to-show", () => win?.show());

  // Fermer = cacher (reste dans le tray)
  win.on("close", (event) => {
    if (!isQuitting) {
      event.preventDefault();
      win?.hide();
    }
  });

}

function createTray() {
  tray = new Tray(ICON_PATH);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Ouvrir 12Dépôt",
      click: () => win?.show(),
    },
    { type: "separator" },
    {
      label: "Quitter",
      click: () => {
        isQuitting = true; // permet de vraiment quitter
        app.quit();
      },
    },
  ]);
  tray.setToolTip("12Dépôt");
  tray.setContextMenu(contextMenu);
  // Double-clic = montrer la fenêtre
  tray.on("double-click", () => win?.show());
}
app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on("before-quit", () => {
    isQuitting = true;
  });

  // IPC: token
  ipcMain.handle("get-token", () => store.get("token"));
  ipcMain.handle("set-token", (_, token: string | null | undefined) => {
    if (token === null || token === undefined) store.delete("token");
    else store.set("token", token);
  });
  ipcMain.handle("delete-token", () => store.delete("token"));

  // Notifications
  ipcMain.on("login-success", (_, data) => {
    new Notification({ title: data.title, body: data.body }).show();
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
    else win?.show();
  });
});

// 💡 On ne quitte pas quand toutes les fenêtres sont « fermées » (on les cache)
app.on("window-all-closed", () => {
  // Laisser l’app tourner dans le tray sur tous les OS.
});
