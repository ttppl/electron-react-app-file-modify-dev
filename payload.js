const {contextBridge, ipcRenderer} = require('electron')

ipcRenderer.invoke('getModules').then(keys=>{
    const exploseFunctions = {}
    keys.forEach(key=>{
        exploseFunctions[key] = (...args) => ipcRenderer.invoke(key, ...args)
    })
    contextBridge.exposeInMainWorld('electronAPI', exploseFunctions)
})




// contextBridge.exposeInMainWorld('electronAPI', {
//     openWindow: (name) => ipcRenderer.invoke('openWindow', name),
//     getConfig: (key) => ipcRenderer.invoke('getConfig', key),
//     getConfigs: (keys) => ipcRenderer.invoke('getConfigs', keys),
//     setConfig: (key,value) => ipcRenderer.invoke('setConfig', key,value),
//     getFileSuffix: (filePath) => ipcRenderer.invoke('getFileSuffix', filePath),
//     getFileName: (filePath) => ipcRenderer.invoke('getFileName', filePath),
//     getFileFullName: (filePath) => ipcRenderer.invoke('getFileFullName', filePath),
//     getFileDir: (filePath) => ipcRenderer.invoke('getFileDir', filePath),
//     showMessage: (options) => ipcRenderer.invoke('showMessage', options),
//     showError: (title, content) => ipcRenderer.invoke('showError', title, content),
//     selectFile: (path) => ipcRenderer.invoke('selectFile', path),
//     selectFilePath: (path) => ipcRenderer.invoke('selectFilePath', path),
//     getFiles: (path, all,filter) => ipcRenderer.invoke('getFiles', path, all,filter),
//     renameFile: (filePath, newName, keepOrigName) => ipcRenderer.invoke('renameFile', filePath, newName, keepOrigName),
//     unzipFile: (filePath, targetPath) => ipcRenderer.invoke('unzipFile', filePath, targetPath),
//     moveFile: (filePath, targetDir) => ipcRenderer.invoke('moveFile', filePath, targetDir),
//     getLog: (page) => ipcRenderer.invoke('getLog',page),
// })

//f12打开开发者工具
window.addEventListener('keydown',e=>{
    const {keyCode} =e;
    if(keyCode === 123){
        ipcRenderer.invoke('openDevTool')
        e.preventDefault();
    }
},false)
