import { ipcRenderer } from 'electron'

export function openChooseDirectoryDialog() {
    ipcRenderer.send('openDirectoryDialog')
}

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}