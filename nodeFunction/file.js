const path = require("path");
const {showNotification, showDialogMsgDebounce, showError} = require("./nativeFunction");
const {writeLog} = require("./log");
const fs = require("fs");
const {dialog} = require("electron");
const {getConfig} = require("./setting");
const {exec} = require("child_process");

//获取文件名
module.exports.getFileName = function (filePath) {
    try {
        return path.basename(filePath, path.extname(filePath))
    } catch (e) {
        showNotification(`文件名获取错误(${e.message})：${filePath}`)
    }
}
// 获取文件全名
module.exports.getFileFullName = function (filePath) {
    try {
        return path.basename(filePath)
    } catch (e) {
        showNotification(`文件全名获取错误(${e.message})：${filePath}`)
    }
}
// 获取文件后缀
module.exports.getFileSuffix = function (filePath) {
    try {
        return path.extname(filePath)
    } catch (e) {
        showNotification(`文件后缀获取错误(${e.message})：${filePath}`)
    }
}
// 获取文件父目录
module.exports.getFileDir = function (filePath) {
    try {
        return path.dirname(filePath)
    } catch (e) {
        showNotification(`文件父目录获取错误(${e.message})：${filePath}\n${e.stack}`)
    }
}
//递归获取目录下所有文件
module.exports.getAllFiles = function (filePath, name) {
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
                files.push(...module.exports.getAllFiles(subPath, name || fileName))
            } else {
                const fileModel = {
                    topName: name || module.exports.getFileName(filePath),
                    name: module.exports.getFileName(fileName),
                    fullName: fileName,
                    suffix: module.exports.getFileSuffix(subPath),
                    parent: module.exports.getFileDir(subPath),
                    path: subPath
                }
                files.push(fileModel)
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
module.exports.getDirFiles = function (filePath) {
    const files = []
    const max = getConfig('maxShowFile')
    try {
        if (!fs.statSync(filePath).isDirectory()) {
            showNotification(`[${filePath}]不是目录!`)
        }
        filePath = path.resolve(filePath)

        const fileNames = fs.readdirSync(filePath)
        for (let fileName of fileNames) {
            const subPath = path.join(filePath, fileName)
            let dir = null
            try {
                dir = fs.statSync(subPath)
            } catch (e) {
                writeLog(`文件信息获取错误(${filePath})：${e.stack}`)
            }
            const fileModel = {
                name: module.exports.getFileName(fileName),
                fullName: fileName,
                dir: !!dir?.isDirectory(),
                suffix: module.exports.getFileSuffix(subPath),
                parent: module.exports.getFileDir(subPath),
                path: subPath
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
module.exports.deleteFile = function (filePath) {
    return new Promise((resolve, reject) => {
        writeLog('删除文件：', filePath, '\n')
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, function (err) {
                if (err) {
                    reject()
                }
                resolve()
            })
        } else {
            writeLog('删除文件不存在：', filePath, '\n')
            resolve()
        }
    })

}
//创建目录
module.exports.createDir = function (dir) {
    if (!fs.existsSync(dir)) {
        module.exports.createDir(module.exports.getFileDir(dir))
        fs.mkdirSync(dir)
    }
}
// 选择文件
module.exports.selectFile = async function () {
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
}
// 选择文件夹
module.exports.selectFilePath = async function (filePath) {
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
}
// 获取文件列表
module.exports.getFiles = (filePath, all) => {
    return all ? module.exports.getAllFiles(filePath) : module.exports.getDirFiles(filePath)
}
// 重命名文件
module.exports.renameFile = (filePath, newName, keepOrigName) => {
    return new Promise((resolve, reject) => {
        const origFileName = module.exports.getFileName(filePath)
        let newFileName = module.exports.getFileName(newName)
        if (module.exports.getFileFullName(filePath) === newName) {
            resolve('新名称与原名称一致！')
            return
        }
        const newFileSuffix = module.exports.getFileSuffix(newName)
        if (newFileName !== origFileName && keepOrigName) {
            newFileName = newFileName + '__' + origFileName
        }
        let newFileFullName = newFileName + newFileSuffix
        let newPath = path.join(module.exports.getFileDir(filePath), newFileFullName)
        let exist = fs.existsSync(newPath)
        let i = 1
        while (exist) {
            newFileFullName = `${newFileName}【${i}】${newFileSuffix}`
            newPath = path.join(module.exports.getFileDir(filePath), newFileFullName)
            exist = fs.existsSync(newPath)
            i++
        }
        writeLog('重命名文件：', `源文件：${filePath}`, `新名称：${newFileFullName}`, '\n')
        fs.rename(filePath, newPath, function (error) {
            if (error) {
                writeLog('重命名错误：', error)
                reject(error)
            }
            resolve(newPath)
        })
    }).catch(e => {
        return e
    })
}
// 解压文件
module.exports.unzipFile = ({filePath, targetPath,password, deleteFileAfterUnzip}) => {
    const winRarPath = getConfig('winRarPath')||path.join(__dirname,'../static')
    module.exports.createDir(targetPath)//创建目录
    var exec = require('child_process').exec
    writeLog('解压文件：', `源文件：${filePath}`, `解压目录：${targetPath}`, '\n')
    var exec_path = `winrar x -or ${password ? ` -p${password}` : ''} "${filePath}" "${targetPath}"`
    return new Promise((resolve, reject) => {
        exec(exec_path, {cwd: path.resolve(winRarPath)}, async function (error, stdout, stderr) {
            if (error) {
                writeLog('解压错误：', filePath, targetPath, error)
                reject(error)
            } else {
                if (deleteFileAfterUnzip) {
                    await module.exports.deleteFile(filePath)
                }
                resolve()
            }
        })
    })
}
// 压缩文件
module.exports.zipFile = ({filePath, targetPath, password, deleteFileAfterzip}) => {
    targetPath = targetPath||module.exports.getFileDir(filePath)
    let targetFilePath = path.join(targetPath,`${module.exports.getFileName(filePath)}.rar`)
    let index = 1
    module.exports.createDir(targetPath)//创建目录
    while(fs.existsSync(targetFilePath)){
        targetFilePath = path.join(targetPath,`${module.exports.getFileName(filePath)}[${index}].rar`)
        index++
    }
    const winRarPath = getConfig('winRarPath')||path.join(__dirname,'../static')
    var exec = require('child_process').exec
    var exec_path = `winrar a -ep -or ${password ? ` -hp${password}` : ''} "${targetFilePath}" "${filePath}"`
    writeLog('压缩文件：', `源文件：${filePath}`, `压缩到：${targetPath}`,`执行命令：${exec_path}`, '\n',)
    return new Promise((resolve, reject) => {
        exec(exec_path, {cwd: path.resolve(winRarPath)}, async function (error, stdout, stderr) {
            if (error) {
                showError('压缩文件出错',error)
                reject(error)
            } else {
                if (deleteFileAfterzip) {
                    await module.exports.deleteFile(filePath)
                }
                resolve()
            }
        })
    })
}
// 移动文件
module.exports.moveFile = (filePath, targetDir) => {
    return new Promise((resolve, reject) => {
        const fileName = module.exports.getFileName(filePath)
        const fullName = module.exports.getFileFullName(filePath)
        const suffix = module.exports.getFileSuffix(filePath)
        let newPath = path.join(path.resolve(targetDir), fullName)
        writeLog('移动文件：', `源文件：${filePath}`, `新目录：${targetDir}`, '\n')
        module.exports.createDir(targetDir)
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
                var readStream = fs.createReadStream(filePath);
                var writeStream = fs.createWriteStream(newPath);
                readStream.pipe(writeStream);
                readStream.on('end', function () {
                    fs.unlinkSync(filePath);
                    resolve()
                });
                readStream.on('error', function (err) {
                    writeLog('移动文件出错',err)
                    reject(error)
                });
            } else {
                resolve()
            }


        })
    })
}
