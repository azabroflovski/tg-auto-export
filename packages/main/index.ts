import { app, BrowserWindow, shell, ipcMain, ipcRenderer, dialog } from 'electron'
import { release } from 'os'
import { join, basename } from 'path'
import { useBot } from './bot'
import { InputFile } from 'grammy'
import glob from 'fast-glob'
import normalizePath from 'normalize-path'

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null = null

async function createWindow() {
  win = new BrowserWindow({
    title: 'App Window',
    minWidth: 460,
    maxWidth: 460,
    width: 460,

    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs'),
      nodeIntegration: true,
      contextIsolation: false,
    },
    autoHideMenuBar: true
  })

  if (app.isPackaged) {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  } else {
    // 🚧 Use ['ENV_NAME'] avoid vite:define plugin
    const url = `http://${process.env['VITE_DEV_SERVER_HOST']}:${process.env['VITE_DEV_SERVER_PORT']}`

    win.loadURL(url)
    // win.webContents.openDevTools()
  }

  // Test active push message to Renderer-process
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })



  ipcMain.on('openDirectoryDialog', (event) => {
    const response = dialog.showOpenDialogSync({
      properties: ['openDirectory']
    })

    if (response) {
      event.reply('updateSettings', { exportDirectory: response[0] })
    }
  })

  let tgBroadcastIds = null
  function createSyncWithTelegram({ exportInterval, exportDirectory, telegramBotToken }) {
    return setInterval(() => {
      sendFiles(exportDirectory, telegramBotToken)
    }, exportInterval * 60000)
  }

  function sendFiles(directory, telegramBotToken) {
    const filesList = glob.sync(normalizePath(directory) + '/*')
    const { bot } = useBot(telegramBotToken)

    if (filesList.length) {
      filesList.forEach((file, index) => {
        setTimeout(async () => {
          try {
            await bot.api.sendDocument(tgBroadcastIds, new InputFile(file))

            win?.webContents.send('fileSend', {
              fileName: basename(file),
              filePath: file,
              sendTime: Date.now(),
              isError: false
            })
          } catch (error) {
            win?.webContents.send('fileSend', {
              fileName: basename(file),
              filePath: file,
              sendTime: Date.now(),
              isError: true
            })
          }
        }, 2000 * index)
      })
    }
  }

  let syncInterval = null

  ipcMain.on('syncWithTelegram', (event, { exportDirectory, exportInterval, telegramBotToken, telegramBotBroadcastIds }) => {
    clearInterval(syncInterval)
    tgBroadcastIds = telegramBotBroadcastIds
    syncInterval = createSyncWithTelegram({ exportInterval, exportDirectory, telegramBotToken })

  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})