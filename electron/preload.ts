// preload.ts
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  getToken: () => ipcRenderer.invoke("get-token"),
  // setToken: (token: string) => ipcRenderer.invoke("set-token", token),
  deleteToken: () => ipcRenderer.invoke("delete-token"),
  setToken: (token: string | null) => ipcRenderer.invoke("set-token", token),
  notifyLoginSuccess: (title: string, body: string) =>
    ipcRenderer.send("login-success", { title, body }),
  // showNotification: (title: string, body: string) =>
  //   ipcRenderer.send("show-notification", { title, body }),
});
