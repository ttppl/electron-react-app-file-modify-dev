const {app, BrowserWindow, Notification, nativeImage, Menu} = require('electron')
const path = require('path')
const mainProcessExplose = require('./MainProcessExplose')
const url = require("url");

Menu.setApplicationMenu(Menu.buildFromTemplate([
    {
        label: '后退',
        click: (menuItem, browserWindow, event) => {
            browserWindow.webContents.goBack()
        }
    },
    {
        label: '前进',
        click: (menuItem, browserWindow, event) => {
            browserWindow.webContents.goForward()
        }
    },
    {
        label: '刷新',
        role: 'forceReload'
    }
]))

const createWindow = () => {
    const win = new BrowserWindow({
        // width: 800,
        // height: 600,
        // fullscreen: true,
        title: 'electron-react',
        icon: nativeImage.createFromPath('public/favicon.ico'),
        webPreferences: {
            preload: path.join(__dirname, 'payload.js'),
            // nodeIntegration: true, // 是否启用node集成 渲染进程的内容有访问node的能力
            contextIsolation : true, //允许渲染进程使用Nodejs
            // webviewTag: true, // 是否使用<webview>标签 在一个独立的 frame 和进程里显示外部 web 内容
            webSecurity: false, // 禁用同源策略
            // nodeIntegrationInSubFrames: true // 是否允许在子页面(iframe)或子窗口(child window)中集成Node.js
        }
    })
    win.maximize()
    // win.loadFile('main.html')

    // 加载应用 --打包react应用后，__dirname为当前文件路径
    // win.loadURL(url.format({
    //     pathname: path.join(__dirname, './build/index.html'),
    //     protocol: 'file:',
    //     slashes: true
    // }));

    // 加载应用 --开发阶段  需要运行 npm run start
    win.loadURL('http://localhost:3000/');
    return win
}

app.whenReady().then(() => {
    mainProcessExplose()
    const mainWindow = createWindow()
    // showNotification()
    mainWindow.webContents.openDevTools()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

// 通知
function showNotification(msg, title) {
    new Notification({title, body: msg}).show()
}
