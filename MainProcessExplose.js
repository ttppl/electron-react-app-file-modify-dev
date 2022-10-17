const {ipcMain, dialog, BrowserWindow, Notification} = require("electron");
const path = require("path");
const fs = require("fs");
const readline = require("readline");
const {showNotification, showDialogMsgDebounce} = require("./nodeFunction/nativeFunction");


const exploseFunctions = {}
const files = fs.readdirSync(path.join(__dirname,'./nodeFunction'))
files.forEach(file=>{
    const fileModule = require(`./nodeFunction/${file}`)
    Object.assign(exploseFunctions,fileModule)
})


module.exports = () => {
    Object.keys(exploseFunctions).forEach(key => {
        ipcMain.handle(key, (e,...args)=>exploseFunctions[key](...args))
    })
    ipcMain.handle('getModules', ()=>Object.keys(exploseFunctions))
}
