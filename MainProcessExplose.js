const {ipcMain, dialog, BrowserWindow, Notification} = require("electron");
const {getConfig, modifyConfig} = require("./utils");
const path = require("path");
const fs = require("fs");
const readline = require("readline");

function showNotification(msg, title = '提示') {
    new Notification({title, body: msg}).show()
    writeLog(msg)
}


const onceMap = new Map()

function showDialogMsgDebounce(msg) {
    if (!onceMap.get(msg)) {
        dialog.showErrorBox(msg, '')
        onceMap.set(msg,setTimeout(() => {
            onceMap.delete(msg)
        }, 1000))
    }

}

// 获取文件名
function getFileName(filePath) {
    let filename = ''
    try {
        filename = path.basename(filePath, path.extname(filePath))
    } catch (e) {
        console.log(e)
        showNotification(`文件名获取错误(${e.message})：${filePath}`)
    }
    return filename

}

// 获取文件全名
function getFileFullName(filePath) {
    // return path.basename(filePath)
    let name = ''
    try {
        name = path.basename(filePath)
    } catch (e) {
        console.log(e)
        showNotification(`文件全名获取错误(${e.message})：${filePath}`)
    }
    return name
}

// 获取文件后缀
function getFileSuffix(filePath) {
    // return path.extname(filePath)
    let name = ''
    try {
        name = path.extname(filePath)
    } catch (e) {
        console.log(e)
        showNotification(`文件后缀获取错误(${e.message})：${filePath}`)
    }
    return name
}

// 获取文件父目录
function getFileDir(filePath) {
    // return path.dirname(filePath)
    let name = ''
    try {
        name = path.dirname(filePath)
    } catch (e) {
        console.log(e)
        showNotification(`文件父目录获取错误(${e.message})：${filePath}`)
    }
    return name
}

// 日志打印
function writeLog(...arg) {
    if (getConfig('writeLog')) {
        fs.appendFileSync('./log', `${new Date().toLocaleString()}:\n` + arg.join('\n') + '\n')
    }
}

//递归获取目录下所有文件
function getAllFiles(filePath, filter,name) {
    try {
        filePath = path.resolve(filePath)
        const files = []
        const fileNames = fs.readdirSync(filePath)
        const max = getConfig('maxShowFile')
        for (let fileName of fileNames) {
            const subPath = path.join(filePath, fileName)
            let dir = null
            try {
                dir = fs.statSync(subPath)
            } catch (e) {
                writeLog(`文件信息获取错误(${filePath})：${e.stack}`)
            }
            if (dir?.isDirectory()) {
                files.push(...getAllFiles(subPath, filter,name || fileName))
            } else {
                const fileModel = {
                    topName: name || getFileName(filePath),
                    name: getFileName(fileName),
                    fullName: fileName,
                    suffix: getFileSuffix(subPath),
                    parent: getFileDir(subPath),
                    path: subPath
                }
                if(!filter||filter(fileModel)) {
                    files.push(fileModel)
                }
            }
            if (files.length > max) {
                showDialogMsgDebounce(`文件过多！大于(${max})`)
                return files
            }
        }
        return files
    } catch (error) {
        writeLog(`文件获取错误(${filePath})：`, error.stack)
        return []
    }

}

//获取目录下文件(包含目录)
function getDirFiles(filePath,filter) {
    const files = []
    const max = getConfig('maxShowFile')
    try {
        // console.log(fs.statSync(filePath))
        if (!fs.statSync(filePath).isDirectory()) {
            showNotification(`[${filePath}]不是目录!`)
        }
        filePath = path.resolve(filePath)

        const fileNames = fs.readdirSync(filePath)
        for(let fileName of fileNames){
            const subPath = path.join(filePath, fileName)
            let dir = null
            try {
                dir = fs.statSync(subPath)
            } catch (e) {
                writeLog(`文件信息获取错误(${filePath})：${e.stack}`)
            }
            const fileModel = {
                name: getFileName(fileName),
                fullName: fileName,
                dir: !!dir?.isDirectory(),
                suffix: getFileSuffix(subPath),
                parent: getFileDir(subPath),
                path: subPath
            }
            if(!filter||filter(fileModel)) {
                files.push(fileModel)
            }
            if (files.length > max) {
                showDialogMsgDebounce(`文件过多！大于(${max})`)
                return files
            }
        }
        return files
    } catch (error) {
        writeLog(`文件获取错误(${filePath})：${error.stack}`)
        return files
    }

}

// 删除文件
function deleteFile(filePath) {
    return new Promise((resolve, reject) => {
        writeLog('删除文件：', filePath, '\n')
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, function (err) {
                if (err) {
                    reject()
                }
                // console.log('文件:'+filePath+'删除成功！');
                resolve()
            })
        } else {
            writeLog('删除文件不存在：', filePath, '\n')
            resolve()
        }
    })

}

//创建目录
function createDir(dir) {
    if (!fs.existsSync(dir)) {
        createDir(getFileDir(dir))
        fs.mkdirSync(dir)
    }
}

//读取日志
function getLog(page){
    const pageSize = getConfig('logPageSize')
    return new Promise((resolve,reject)=>{
        const rl = readline.createInterface({
            input: fs.createReadStream('./log'),
            output: process.stdout,
            terminal: false
        });
        let lineCount = 0
        let lines = []
        rl.on('line', (line) => {
            lineCount++
            if(page){
                if(lineCount>pageSize*(page-1)){
                    if(lineCount>pageSize*page){
                        resolve({lineCount,lines})
                        rl.close()
                        return
                    }
                    lines.push(line)
                }
            }else {
                if(lineCount%pageSize===1){
                    lines = []
                }
                lines.push(line)
            }

        });
        rl.on('close', () => {
            resolve({lineCount,pages:Math.ceil(lineCount/pageSize), lines})
        });
    })
}

const oprations = {
    getConfig: (e, key) => {
        return getConfig(key)
    },
    getConfigs: (e, keys) => {
        const config = {}
        keys.map(key => {
            config[key] = getConfig(key)
        })
        return config
    },
    setConfig: (e, key, value) => {
        return modifyConfig(key, value)
    },
    getFileSuffix: (e, filePath) => getFileSuffix(filePath),
    getFileName: (e, filePath) => getFileName(filePath),
    getFileFullName: (e, filePath) => getFileFullName(filePath),
    getFileDir: (e, filePath) => getFileDir(filePath),
    // 选择文件
    selectFile: async function () {
        const {canceled, filePaths} = await dialog.showOpenDialog({
            title: '请选择文件',
            defaultPath: path.resolve(getConfig('defaultPath')),
            buttonLabel: '拿来吧你',
            properties: ['openFile', 'multiSelections']
        })
        if (canceled) {
            return
        } else {
            return filePaths[0]
        }
    },
    // 选择文件夹
    selectFilePath: async function (e, filePath) {
        const {canceled, filePaths} = await dialog.showOpenDialog({
            title: '请选择文件夹',
            defaultPath: path.resolve(filePath || getConfig('defaultPath')),
            buttonLabel: '拿来吧你',
            properties: ['openDirectory']
        })
        if (canceled) {
            return
        } else {
            return filePaths[0]
        }
    },
    // 打开新窗口
    openWindow: function (e, name) {
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
    },
    // 显示错误信息
    showError: (e, title, content = '') => {
        if (title) {
            dialog.showErrorBox(title, content)
        }
    },
    showMessage: (e, options) => {
        if (options) {
            return dialog.showMessageBox(options)
        }
    },
    // 获取文件列表
    getFiles: (e, filePath, all,filter) => {
        return all ? getAllFiles(filePath,filter) : getDirFiles(filePath,filter)
    },
    // 重命名文件
    renameFile: (e, filePath, newName, keepOrigName) => {
        return new Promise((resolve, reject) => {
            const origFileName = getFileName(filePath)
            let newFileName = getFileName(newName)
            if (getFileFullName(filePath) === newName) {
                resolve('新名称与原名称一致！')
                return
            }
            const newFileSuffix = getFileSuffix(newName)
            if (newFileName !== origFileName && keepOrigName) {
                newFileName = newFileName + '__' + origFileName
            }
            let newFileFullName = newFileName + newFileSuffix
            let newPath = path.join(getFileDir(filePath), newFileFullName)
            let exist = fs.existsSync(newPath)
            let i = 1
            while (exist) {
                newFileFullName = `${newFileName}【${i}】${newFileSuffix}`
                newPath = path.join(getFileDir(filePath), newFileFullName)
                exist = fs.existsSync(newPath)
                i++
            }
            writeLog('重命名文件：', `源文件：${filePath}`, `新名称：${newFileFullName}`, '\n')
            fs.rename(filePath, newPath, function (error) {
                if (error) {
                    console.error('重命名错误：', filePath, newName, error)
                    reject(error)
                }
                resolve(newPath)
            })
        }).catch(e => {
            return e
        })
    },
    // 解压文件
    unzipFile: (e, filePath, targetPath) => {
        const winRarPath = getConfig('winRarPath')
        const unzipAutoRename = getConfig('unzipAutoRename')
        const password = getConfig('password')
        const deleteFileAfterUnzip = getConfig('deleteFileAfterUnzip')
        var exec = require('child_process').exec
        writeLog('解压文件：', `源文件：${filePath}`, `解压目录：${targetPath}`, '\n')
        var exec_path = `winrar x ${unzipAutoRename ? ' -or' : ''} ${password ? ` -p${password}` : ''} "${filePath}" "${targetPath}"`
        return new Promise((resolve, reject) => {
            exec(exec_path, {cwd: path.resolve(winRarPath)}, async function (error, stdout, stderr) {
                if (error) {
                    writeLog('解压错误：', filePath, targetPath, error)
                    reject(error)
                } else {
                    if (deleteFileAfterUnzip) {
                        await deleteFile(filePath)
                    }
                    resolve()
                }
            })
        })
    },
    // 移动文件
    moveFile: (e, filePath, targetDir) => {
        return new Promise((resolve, reject) => {
            const fileName = getFileName(filePath)
            const fullName = getFileFullName(filePath)
            const suffix = getFileSuffix(filePath)
            let newPath = path.join(path.resolve(targetDir), fullName)
            writeLog('移动文件：', `源文件：${filePath}`, `新目录：${targetDir}`, '\n')
            createDir(targetDir)
            let exist = fs.existsSync(newPath)
            let i = 1
            while (exist) {
                const newFileFullName = `${fileName}【${i}】${suffix}`
                newPath = path.join(path.resolve(targetDir), newFileFullName)
                exist = fs.existsSync(newPath)
                i++
            }
            fs.rename(filePath, newPath, function (error) {
                if (error) {
                    console.error('移动错误：', filePath, newPath, error)
                    reject(error)
                }
                resolve()

            })
        })
    },
    getLog:(e,page)=>getLog(page)
}

module.exports = () => {
    Object.keys(oprations).forEach(key => {
        ipcMain.handle(key, oprations[key])
    })
}
