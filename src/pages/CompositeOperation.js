import {useEffect, useRef, useState} from "react";
import RecursiveFileOperation from "../components/RecursiveFileOperation";
import OperationButton from "../components/OperationButton";
import {
    moveToDirOperation,
    renameToTopNameOperation,
    renameUnzippableFileOperation,
    unzipFileOperation
} from "../utils/oprations";

function CompositeOperation() {
    const [targetDir,setTargetDir] = useState('')
    const selectTargetDir = async()=>{
        const fp = await window.electronAPI.selectFilePath(targetDir)
        setTargetDir(fp)
    }
    const zipFile = useRef('')
    const keepOrigName = useRef('')
    const unzipableFile = useRef([])
    // 获取参数
    useEffect(() => {
        window.electronAPI.getConfigs(['defaultPath','defaultMoveTargetPath','zipFile','keepOrigName','unzipableFile']).then(para => {
            ref.current.getFiles(para.defaultPath)
            setTargetDir(para.defaultMoveTargetPath)
            zipFile.current = para.zipFile
            keepOrigName.current = para.keepOrigName
            unzipableFile.current = para.unzipableFile
        })
    }, [])

    const confirm = async ({files, setFiles}) => {
        while(await renameUnzippableFileOperation({files, setFiles,unzippableFile:zipFile.current})){
            files = await ref.current.getFiles()
            await unzipFileOperation({files, setFiles,unzipableFile:unzipableFile.current})
            files = await ref.current.getFiles()
        }
        files = await ref.current.getFiles()
        await renameToTopNameOperation({files, setFiles,keepOrigName:keepOrigName.current})
        files = await ref.current.getFiles()
        await moveToDirOperation({files, setFiles,targetDir})
    }

    const ref = useRef(null)
    return <RecursiveFileOperation ref={ref} confirm={confirm}
                                   hideCompleteFile={false}
                                   operations={<OperationButton done={targetDir} onclick={selectTargetDir}>选择目标文件夹</OperationButton>}>
        <div className='xl-file-view-path'>目标文件夹：{targetDir}</div>
    </RecursiveFileOperation>
}

export default CompositeOperation
