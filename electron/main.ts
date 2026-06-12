import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'fs'
import { execSync } from 'child_process'
import { tmpdir } from 'os'

let tray: Tray | null = null
let pinnedToDesktop = false

function loadNative() {
  const nodePath = app.isPackaged
    ? join(process.resourcesPath, 'windowlevel.node')
    : join(__dirname, '../../build/Release/windowlevel.node')
  try {
    return require(nodePath)
  } catch {
    return null
  }
}

function applyWindowLevel(win: BrowserWindow) {
  const native = loadNative()
  if (!native) return
  const handle = win.getNativeWindowHandle()
  if (pinnedToDesktop) {
    native.setDesktopLevel(handle)
    win.setAlwaysOnTop(false)
  } else {
    native.setNormalLevel(handle)
  }
}

function buildTrayMenu(win: BrowserWindow): Menu {
  return Menu.buildFromTemplate([
    {
      label: '釘在桌面',
      type: 'checkbox',
      checked: pinnedToDesktop,
      click() {
        pinnedToDesktop = !pinnedToDesktop
        applyWindowLevel(win)
        tray?.setContextMenu(buildTrayMenu(win))
      },
    },
    { type: 'separator' },
    {
      label: '顯示 / 隱藏',
      click() {
        win.isVisible() ? win.hide() : win.show()
      },
    },
    { type: 'separator' },
    { label: '結束', role: 'quit' },
  ])
}

function createWindow(): void {
  const win = new BrowserWindow({
    width: 320,
    height: 320,
    resizable: false,
    frame: false,
    transparent: true,
    hasShadow: true,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  win.setAlwaysOnTop(false)
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: false })

  if (process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Tray
  const iconPath = app.isPackaged
    ? join(process.resourcesPath, 'tray-icon.png')
    : join(__dirname, '../../icon/icon_512.png')
  const trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })
  tray = new Tray(trayIcon)
  tray.setToolTip('日日台灣')
  tray.setContextMenu(buildTrayMenu(win))
  tray.on('click', () => tray?.popUpContextMenu())
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle('set-dock-icon', (_e, dataUrl: string) => {
  try {
    const base64 = dataUrl.replace(/^data:image\/png;base64,/, '')
    const img = nativeImage.createFromBuffer(Buffer.from(base64, 'base64'))
    app.dock?.setIcon(img)
  } catch {}
})

ipcMain.handle('read-calendar-data', () => {
  const candidates = [
    join(process.resourcesPath, 'resources', 'data', 'calendar.json'),
    join(app.getAppPath(), 'resources', 'data', 'calendar.json'),
  ]
  for (const p of candidates) {
    try {
      return JSON.parse(readFileSync(p, 'utf-8'))
    } catch {}
  }
  return []
})

// Audio files can't be served over file:// in the renderer, so read the requested
// mp3 from resources and hand it back as a data URL. Filename only (no path) —
// reject anything with separators so it can't escape the audio directory.
ipcMain.handle('read-audio', (_e, file: string) => {
  if (!/^[\w.-]+\.mp3$/.test(file)) return null
  const candidates = [
    join(process.resourcesPath, 'resources', 'data', 'audio', file),
    join(app.getAppPath(), 'resources', 'data', 'audio', file),
  ]
  for (const p of candidates) {
    try {
      const base64 = readFileSync(p).toString('base64')
      return `data:audio/mpeg;base64,${base64}`
    } catch {}
  }
  return null
})
