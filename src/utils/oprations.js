import {joinPath} from "./convert";
import {electronApi} from "./main";

export const renameUnzippableFileOperation = async ({files, setFiles,unzippableFile}) => {
    let find = false
    for (let file of files) {
        const type = unzippableFile.find(item => item.suffix === file.suffix)
        if(type) {
            file.loading = true
            setFiles([...files])
            await await electronApi().renameFile(file.path, file.name + type.to)
            file.done = true
            setFiles([...files])
            find = true
        }
    }
    return find
}

export const unzipFileOperation = async ({files, setFiles,unzipableFile,multipleThreadUnzip}) => {
    const deleteFileAfterUnzip = await electronApi().getConfig('deleteFileAfterUnzip')
    const password = await electronApi().getConfig('unzipPassword')
    for (let file of files) {
        if(unzipableFile.includes(file.suffix)) {
            file.loading = true
            setFiles([...files])
            if(!multipleThreadUnzip) {
                await electronApi().unzipFile({filePath:file.path, targetPath:file.parent,password, deleteFileAfterUnzip})
            }else{
                electronApi().unzipFile({filePath:file.path, targetPath:file.parent,password, deleteFileAfterUnzip})
            }
            file.done = true
            setFiles([...files])
        }
    }
}

export const renameToTopNameOperation = async ({files, setFiles,keepOrigName}) => {
    for (let file of files) {
        file.loading = true
        setFiles([...files])
        await electronApi().renameFile(file.path, file.topName + file.suffix, keepOrigName)
        file.done = true
        setFiles([...files])
    }
}
export const moveToDirOperation = async ({files, setFiles,targetDir}) => {
    const filesMap = new Map()
    files.forEach(file => {
        const topName = file.topName || ''
        let typeMap = filesMap.get(topName)
        if (!typeMap) {
            typeMap = new Map()
            filesMap.set(topName, typeMap)
        }
        const type = file.suffix.slice(1)
        const typeArray = typeMap.get(type)
        if (typeArray) {
            typeArray.push(file.path)
        } else {
            typeMap.set(type, [file.path])
        }
    })
    for(let file of files){
        file.loading=true
        setFiles([...files])
        const typesMap = filesMap.get(file.topName)
        const type = file.suffix.slice(1)
        let typePath = joinPath(targetDir,type)
        const typeArray = typesMap.get(type)
        if (typeArray.length > 1) {
            typePath = joinPath(targetDir, type, file.topName)
        }
        await electronApi().moveFile(file.path, typePath)
        file.done=true
        setFiles([...files])
    }
    // const topNames = filesMap.keys()
    // for (let topName of topNames) {
    //     const typesMap = filesMap.get(topName)
    //     const types = typesMap.keys()
    //     for (let type of types) {
    //
    //         for (let file of typeArray) {
    //
    //         }
    //     }
    // }
}
