const {dialog, Notification, BrowserWindow} = require("electron");
const {writeLog} = require("./log");
const path = require("path");

//弹窗显示信息
module.exports.showNotification = function (msg, title = '提示') {
    new Notification({title, body: msg}).show()
    writeLog(msg)
}
//弹窗显示信息，防抖-1000
const onceMap = new Map()
module.exports.showDialogMsgDebounce = function (msg) {
    if (!onceMap.get(msg)) {
        dialog.showErrorBox(msg, '')
        onceMap.set(msg, setTimeout(() => {
            onceMap.delete(msg)
        }, 1000))
    }
}
// 打开新窗口
module.exports.openWindow = function (name) {
    const win = new BrowserWindow({
        width: 900,
        height: 700,
        // fullscreen: true,
        webPreferences: {
            preload: path.join(__dirname, 'payload.js')
        }
    })
    // win.maximize()
    win.webContents.openDevTools()
    win.loadFile('pages/' + name + '.html')
}
// 显示错误信息
module.exports.showError = (title, content = '') => {
    if (title) {
        dialog.showErrorBox(title, content)
        writeLog(title,content)
    }
}
//显示提示信息
module.exports.showMessage = (options) => {
    if (options) {
        return dialog.showMessageBox(options)
    }
}
//打开开发者工具
module.exports.openDevTool = function (){
    BrowserWindow.getAllWindows()[0].webContents.toggleDevTools()
}
